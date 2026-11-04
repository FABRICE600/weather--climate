// Secure backend proxy for weather data.
//
// The frontend never calls a weather API directly; it calls this edge function,
// which mirrors the role of a Node.js/Express backend. The function returns a
// unified JSON shape regardless of provider:
//   { success, data: { current, hourly: [...12], daily: [...7] } }
//
// Provider selection:
//   - If the OPENWEATHER_API_KEY secret is configured, the function uses the
//     OpenWeather One Call API 3.0 (geocoding + /onecall/3.0/forecast). This is
//     the primary provider and the API key never reaches the browser.
//   - Otherwise it falls back to Open-Meteo (free, no key) so the app keeps
//     working until a key is added.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------- Shared output types ----------

interface CurrentWeather {
  city: string;
  country: string;
  countryName: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string; // emoji
  iconCode: string; // provider-native code for icon image
  humidity: number;
  windSpeed: number;
  pressure: number;
  timezone: string;
  lat: number;
  lon: number;
}

interface HourlyPoint {
  time: string; // ISO local-ish label, e.g. "14:00"
  temp: number;
}

interface DailyPoint {
  date: string; // ISO date
  dayName: string;
  tempMax: number;
  tempMin: number;
  description: string;
  icon: string; // emoji
  iconCode: string;
  humidity: number;
  windSpeed: number;
  precipitation: number; // probability 0-1 or mm
}

interface WeatherPayload {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
}

// ---------- OpenWeather icon mapping (code -> emoji) ----------

const OW_ICON_EMOJI: Record<string, string> = {
  "01d": "☀️", "01n": "🌙",
  "02d": "🌤️", "02n": "☁️",
  "03d": "☁️", "03n": "☁️",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌦️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌧️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "🌨️", "13n": "🌨️",
  "50d": "🌫️", "50n": "🌫️",
};

// ---------- Open-Meteo WMO code mapping ----------

const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Fog", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌧️" },
  56: { description: "Light freezing drizzle", icon: "🌧️" },
  57: { description: "Dense freezing drizzle", icon: "🌧️" },
  61: { description: "Slight rain", icon: "🌦️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌧️" },
  67: { description: "Heavy freezing rain", icon: "🌧️" },
  71: { description: "Slight snow fall", icon: "🌨️" },
  73: { description: "Moderate snow fall", icon: "🌨️" },
  75: { description: "Heavy snow fall", icon: "❄️" },
  77: { description: "Snow grains", icon: "🌨️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌧️" },
  82: { description: "Violent rain showers", icon: "⛈️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "❄️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" },
};

function wmoTo(code: number): { description: string; icon: string } {
  return WMO_CODES[code] ?? { description: "Unknown", icon: "🌡️" };
}

// ---------- Helpers ----------

function owEmoji(code: string): string {
  return OW_ICON_EMOJI[code] ?? "🌡️";
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayName(iso: string): string {
  const d = new Date(iso);
  return DAY_NAMES[d.getDay()];
}

function hourLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  return `${h.toString().padStart(2, "0")}:00`;
}

// Fallback coordinates for Rwanda districts that geocoding APIs sometimes miss
// (e.g. Nyaruguru). Keyed by lowercase name. Coordinates are approximate
// district centers. Used only when geocoding returns no results.
const RWANDA_FALLBACK_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  nyaruguru: { lat: -2.5, lon: 29.55, name: "Nyaruguru" },
  nyamasheke: { lat: -2.38, lon: 28.87, name: "Nyamasheke" },
  rutsiro: { lat: -1.94, lon: 29.26, name: "Rutsiro" },
  ngororero: { lat: -2.0, lon: 29.25, name: "Ngororero" },
  nyabihu: { lat: -1.67, lon: 29.5, name: "Nyabihu" },
  karongi: { lat: -2.0, lon: 29.02, name: "Karongi" },
  rusizi: { lat: -2.46, lon: 28.92, name: "Rusizi" },
  rubavu: { lat: -1.68, lon: 29.34, name: "Rubavu" },
  bugesera: { lat: -2.1, lon: 30.1, name: "Bugesera" },
  gatsibo: { lat: -1.6, lon: 30.2, name: "Gatsibo" },
  kayonza: { lat: -1.87, lon: 30.45, name: "Kayonza" },
  kirehe: { lat: -2.2, lon: 30.6, name: "Kirehe" },
  ngoma: { lat: -2.15, lon: 30.5, name: "Ngoma" },
  nyagatare: { lat: -1.3, lon: 30.33, name: "Nyagatare" },
  rwamagana: { lat: -1.95, lon: 30.43, name: "Rwamagana" },
  burera: { lat: -1.49, lon: 29.81, name: "Burera" },
  gakenke: { lat: -1.69, lon: 29.79, name: "Gakenke" },
  gicumbi: { lat: -1.57, lon: 30.16, name: "Gicumbi" },
  musanze: { lat: -1.48, lon: 29.64, name: "Musanze" },
  rulindo: { lat: -1.73, lon: 29.77, name: "Rulindo" },
  gisagara: { lat: -2.58, lon: 29.62, name: "Gisagara" },
  huga: { lat: -2.37, lon: 29.74, name: "Huye" },
  huye: { lat: -2.37, lon: 29.74, name: "Huye" },
  kamonyi: { lat: -2.0, lon: 29.67, name: "Kamonyi" },
  muhanga: { lat: -2.07, lon: 29.64, name: "Muhanga" },
  nyamagabe: { lat: -2.3, lon: 29.54, name: "Nyamagabe" },
  nyanza: { lat: -2.35, lon: 29.56, name: "Nyanza" },
  ruhango: { lat: -2.13, lon: 29.73, name: "Ruhango" },
  gasabo: { lat: -1.95, lon: 30.1, name: "Gasabo" },
  kicukiro: { lat: -2.0, lon: 30.13, name: "Kicukiro" },
  nyarugenge: { lat: -1.97, lon: 30.06, name: "Nyarugenge" },
};

// ============================================================
// OpenWeather provider (geocoding + One Call 3.0 forecast)
// ============================================================

async function fetchOpenWeather(city: string, apiKey: string): Promise<WeatherPayload> {
  // 1. Geocode the city name -> lat/lon
  // Request multiple results and prefer Rwanda (country code RW) when the
  // query matches a Rwandan district name (avoids e.g. "Ngoma" matching Goma, DRC).
  const geoUrl =
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}` +
    `&limit=5&appid=${apiKey}`;

  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) {
    throw new Error("Unable to reach OpenWeather geocoding service.");
  }
  const geoData = (await geoRes.json()) as Array<{
    name: string;
    country: string;
    lat: number;
    lon: number;
  }>;

  if (!Array.isArray(geoData) || geoData.length === 0) {
    throw new Error("City not found. Please try again.");
  }

  // Prefer a Rwanda match; fall back to the first result.
  const place = geoData.find((g) => g.country === "RW") ?? geoData[0];

  // 2. One Call API 3.0 forecast (current + hourly + daily, metric)
  const weatherUrl =
    `https://api.openweathermap.org/data/3.0/onecall?lat=${place.lat}` +
    `&lon=${place.lon}&units=metric&appid=${apiKey}`;

  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    if (weatherRes.status === 401) {
      throw new Error("Weather API key is invalid or not activated yet.");
    }
    throw new Error("Unable to reach OpenWeather service.");
  }
  const w = (await weatherRes.json()) as {
    timezone: string;
    current: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
      wind_speed: number;
      weather: Array<{ id: number; main: string; description: string; icon: string }>;
    };
    hourly: Array<{
      dt: number;
      temp: number;
      weather: Array<{ icon: string }>;
    }>;
    daily: Array<{
      dt: number;
      temp: { max: number; min: number };
      humidity: number;
      wind_speed: number;
      pop: number;
      weather: Array<{ description: string; icon: string }>;
    }>;
  };

  const cur = w.current;
  const curCond = cur.weather[0];

  const current: CurrentWeather = {
    city: place.name,
    country: place.country ?? "",
    countryName: "", // OpenWeather geocoding only returns country code
    temperature: Math.round(cur.temp),
    feelsLike: Math.round(cur.feels_like),
    description: curCond.description,
    icon: owEmoji(curCond.icon),
    iconCode: curCond.icon,
    humidity: Math.round(cur.humidity),
    windSpeed: Math.round(cur.wind_speed * 10) / 10,
    pressure: Math.round(cur.pressure),
    timezone: w.timezone,
    lat: place.lat,
    lon: place.lon,
  };

  // Next 12 hourly points (skip the current hour for a cleaner trend)
  const hourly: HourlyPoint[] = w.hourly
    .slice(1, 13)
    .map((h) => ({
      time: hourLabel(new Date(h.dt * 1000).toISOString()),
      temp: Math.round(h.temp),
    }));

  // 7-day forecast
  const daily: DailyPoint[] = w.daily.slice(0, 7).map((d) => {
    const cond = d.weather[0];
    const iso = new Date(d.dt * 1000).toISOString();
    return {
      date: iso,
      dayName: dayName(iso),
      tempMax: Math.round(d.temp.max),
      tempMin: Math.round(d.temp.min),
      description: cond.description,
      icon: owEmoji(cond.icon),
      iconCode: cond.icon,
      humidity: Math.round(d.humidity),
      windSpeed: Math.round(d.wind_speed * 10) / 10,
      precipitation: d.pop,
    };
  });

  return { current, hourly, daily };
}

// ============================================================
// Open-Meteo provider (geocoding + forecast) — fallback
// ============================================================

async function fetchOpenMeteo(city: string): Promise<WeatherPayload> {
  // Request multiple results and prefer Rwanda (country code RW) to avoid
  // cross-border mismatches (e.g. "Ngoma" matching Goma in DRC).
  const geoUrl =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}` +
    `&count=10&language=en&format=json`;

  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) throw new Error("Unable to reach geocoding service.");
  const geoData = (await geoRes.json()) as {
    results?: Array<{
      name: string;
      country_code?: string;
      country?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }>;
  };

  if (!geoData.results || geoData.results.length === 0) {
    // Try fallback coordinates for known Rwanda districts.
    const fallback = RWANDA_FALLBACK_COORDS[city.toLowerCase()];
    if (fallback) {
      return await fetchOpenMeteoByCoords(city, fallback.lat, fallback.lon, "RW", "Rwanda");
    }
    throw new Error("City not found. Please try again.");
  }

  // Prefer an exact-name match in Rwanda; fall back to first result.
  const exactRwanda = geoData.results.find(
    (r) => r.country_code === "RW" && r.name.toLowerCase() === city.toLowerCase()
  );
  const anyRwanda = geoData.results.find((r) => r.country_code === "RW");
  const place = exactRwanda ?? anyRwanda ?? geoData.results[0];

  return await fetchOpenMeteoByCoords(
    place.name,
    place.latitude,
    place.longitude,
    place.country_code ?? place.country ?? "",
    place.country ?? "",
    place.timezone,
  );
}

// Fetch Open-Meteo weather by coordinates. Shared by fetchOpenMeteo (geocoded)
// and the fallback-coordinates path for districts geocoding APIs miss.
async function fetchOpenMeteoByCoords(
  cityName: string,
  lat: number,
  lon: number,
  countryCode: string,
  countryName: string,
  timezone?: string,
): Promise<WeatherPayload> {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,` +
    `weather_code,wind_speed_10m,pressure_msl` +
    `&hourly=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
    `relative_humidity_2m_max,wind_speed_10m_max,precipitation_probability_max` +
    `&timezone=auto&forecast_days=7`;

  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) throw new Error("Unable to reach weather service.");
  const w = (await weatherRes.json()) as {
    timezone: string;
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      weather_code: number;
      wind_speed_10m: number;
      pressure_msl: number;
    };
    hourly: {
      time: string[];
      temperature_2m: number[];
      weather_code: number[];
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      relative_humidity_2m_max: number[];
      wind_speed_10m_max: number[];
      precipitation_probability_max: number[];
    };
  };

  const cur = w.current;
  const wmo = wmoTo(cur.weather_code);

  const current: CurrentWeather = {
    city: cityName,
    country: countryCode,
    countryName: countryName,
    temperature: Math.round(cur.temperature_2m),
    feelsLike: Math.round(cur.apparent_temperature),
    description: wmo.description,
    icon: wmo.icon,
    iconCode: `wmo_${cur.weather_code}`,
    humidity: Math.round(cur.relative_humidity_2m),
    windSpeed: Math.round(cur.wind_speed_10m * 10) / 10,
    pressure: Math.round(cur.pressure_msl),
    timezone: timezone ?? w.timezone,
    lat,
    lon,
  };

  // Next 12 hourly points: find the index of the current hour, then slice.
  const nowHour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  let startIdx = w.hourly.time.findIndex((t) => t.slice(0, 13) >= nowHour);
  if (startIdx < 0) startIdx = 0;
  const hourly: HourlyPoint[] = w.hourly.time
    .slice(startIdx + 1, startIdx + 13)
    .map((t, i) => ({
      time: hourLabel(t),
      temp: Math.round(w.hourly.temperature_2m[startIdx + 1 + i]),
    }));

  const daily: DailyPoint[] = w.daily.time.slice(0, 7).map((d, i) => {
    const wmoD = wmoTo(w.daily.weather_code[i]);
    return {
      date: d,
      dayName: dayName(d),
      tempMax: Math.round(w.daily.temperature_2m_max[i]),
      tempMin: Math.round(w.daily.temperature_2m_min[i]),
      description: wmoD.description,
      icon: wmoD.icon,
      iconCode: `wmo_${w.daily.weather_code[i]}`,
      humidity: Math.round(w.daily.relative_humidity_2m_max[i]),
      windSpeed: Math.round(w.daily.wind_speed_10m_max[i] * 10) / 10,
      precipitation: (w.daily.precipitation_probability_max[i] ?? 0) / 100,
    };
  });

  return { current, hourly, daily };
}

// ============================================================
// Request handler
// ============================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  if (!url.pathname.endsWith("/weather-proxy") && !url.pathname.endsWith("/")) {
    return json({ success: false, error: "Not found" }, 404);
  }

  const city = (url.searchParams.get("city") || "").trim();

  if (!city) {
    return json({ success: false, error: "Please enter a city name." }, 400);
  }
  if (city.length > 80) {
    return json({ success: false, error: "City name is too long." }, 400);
  }

  const owKey = Deno.env.get("OPENWEATHER_API_KEY");

  try {
    let payload: WeatherPayload;
    let provider = "open-meteo";

    if (owKey && owKey.length > 5) {
      provider = "openweather";
      try {
        payload = await fetchOpenWeather(city, owKey);
      } catch (owErr) {
        // If the OpenWeather key is invalid/unactivated, fall back gracefully
        // so the app still returns data instead of hard-failing.
        console.warn("OpenWeather failed, falling back to Open-Meteo:", owErr instanceof Error ? owErr.message : owErr);
        payload = await fetchOpenMeteo(city);
        provider = "open-meteo";
      }
    } else {
      payload = await fetchOpenMeteo(city);
    }

    return json({ success: true, data: payload, provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    if (message.includes("City not found")) {
      return json({ success: false, error: message }, 404);
    }
    return json({ success: false, error: "Unable to connect to the server.", detail: message }, 500);
  }
});
