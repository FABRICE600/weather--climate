import type { DailyPoint, HourlyPoint, WeatherPayload } from "./types";

const weatherCode = (code: number) => {
  if (code === 0) return ["Clear sky", "01d"];
  if (code <= 3) return ["Partly cloudy", "02d"];
  if (code <= 48) return ["Foggy", "50d"];
  if (code <= 67 || code >= 80) return ["Rain showers", "10d"];
  if (code <= 77) return ["Snow", "13d"];
  return ["Thunderstorm", "11d"];
};

export async function fetchWeather(city: string): Promise<WeatherPayload> {
  const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if (!geoResponse.ok) throw new Error("Unable to find that location.");
  const geo = await geoResponse.json();
  const place = geo.results?.[0];
  if (!place) throw new Error("Location not found. Try another city.");

  const params = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure", hourly: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability", daily: "weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max,precipitation_sum", timezone: "auto", forecast_days: "7" });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Weather data is temporarily unavailable.");
  const data = await response.json();
  const currentIcon = weatherCode(data.current.weather_code);
  const hourly: HourlyPoint[] = data.hourly.time.slice(0, 24).map((time: string, index: number) => ({ time: time.slice(11, 16), temp: Math.round(data.hourly.temperature_2m[index]) }));
  const daily: DailyPoint[] = data.daily.time.map((date: string, index: number) => { const icon = weatherCode(data.daily.weather_code[index]); return { date, dayName: new Date(`${date}T12:00:00`).toLocaleDateString("en", { weekday: "short" }), tempMax: Math.round(data.daily.temperature_2m_max[index]), tempMin: Math.round(data.daily.temperature_2m_min[index]), description: icon[0], icon: icon[1], iconCode: icon[1], humidity: Math.round(data.daily.relative_humidity_2m_max[index]), windSpeed: Math.round(data.daily.wind_speed_10m_max[index]), precipitation: Math.round(data.daily.precipitation_sum[index]) }; });
  return { current: { city: place.name, country: place.country_code, countryName: place.country, temperature: Math.round(data.current.temperature_2m), feelsLike: Math.round(data.current.apparent_temperature), description: currentIcon[0], icon: currentIcon[1], iconCode: currentIcon[1], humidity: Math.round(data.current.relative_humidity_2m), windSpeed: Math.round(data.current.wind_speed_10m), pressure: Math.round(data.current.surface_pressure), timezone: data.timezone, lat: place.latitude, lon: place.longitude }, hourly, daily };
}
