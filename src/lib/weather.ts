import type { DailyPoint, HourlyPoint, WeatherPayload } from "./types";

const REQUEST_TIMEOUT_MS = 15000;

// Maps a WMO weather code to a description, an emoji and the code used for backgrounds and alerts.
export function weatherCode(code: number): [string, string, string] {
  const iconCode = `wmo_${code}`;
  if (code === 0) return ["Clear sky", "☀️", iconCode];
  if (code <= 3) return ["Partly cloudy", "⛅", iconCode];
  if (code <= 48) return ["Foggy", "🌫️", iconCode];
  if (code <= 57) return ["Drizzle", "🌦️", iconCode];
  if (code <= 67) return ["Rain", "🌧️", iconCode];
  if (code <= 77) return ["Snow", "🌨️", iconCode];
  if (code <= 82) return ["Rain showers", "🌧️", iconCode];
  if (code <= 86) return ["Snow showers", "🌨️", iconCode];
  return ["Thunderstorm", "⛈️", iconCode];
}

export async function request(url: string): Promise<Response> {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("The weather service took too long to respond. Please try again.");
    }
    throw new Error("Could not reach the weather service. Check your connection.");
  }
}

export async function fetchWeather(city: string): Promise<WeatherPayload> {
  const geoResponse = await request(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if (!geoResponse.ok) throw new Error("Unable to find that location.");
  const geo = await geoResponse.json();
  const place = geo.results?.[0];
  if (!place) throw new Error("Location not found. Try another city.");

  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure",
    hourly: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max,precipitation_sum",
    timezone: "auto",
    forecast_days: "7",
  });
  const response = await request(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Weather data is temporarily unavailable.");
  const data = await response.json();

  const [currentDescription, currentEmoji, currentCode] = weatherCode(data.current.weather_code);
  const hourly: HourlyPoint[] = data.hourly.time.slice(0, 24).map((time: string, index: number) => ({
    time: time.slice(11, 16),
    temp: Math.round(data.hourly.temperature_2m[index]),
  }));
  const daily: DailyPoint[] = data.daily.time.map((date: string, index: number) => {
    const [description, icon, iconCode] = weatherCode(data.daily.weather_code[index]);
    return {
      date,
      dayName: new Date(`${date}T12:00:00`).toLocaleDateString("en", { weekday: "short" }),
      tempMax: Math.round(data.daily.temperature_2m_max[index]),
      tempMin: Math.round(data.daily.temperature_2m_min[index]),
      description,
      icon,
      iconCode,
      humidity: Math.round(data.daily.relative_humidity_2m_max[index]),
      windSpeed: Math.round(data.daily.wind_speed_10m_max[index]),
      precipitation: Math.round(data.daily.precipitation_sum[index]),
    };
  });

  return {
    current: {
      city: place.name,
      country: place.country_code,
      countryName: place.country,
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      description: currentDescription,
      icon: currentEmoji,
      iconCode: currentCode,
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      pressure: Math.round(data.current.surface_pressure),
      timezone: data.timezone,
      lat: place.latitude,
      lon: place.longitude,
    },
    hourly,
    daily,
  };
}
