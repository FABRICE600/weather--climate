import { request, weatherCode } from "./weather";
import { RWANDA_DISTRICTS } from "./rwandaDistricts";

export interface DistrictWeather {
  name: string;
  province: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  description: string;
  icon: string;
  iconCode: string;
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  precipitation: number;
}

// One request covers all 30 districts; Open-Meteo returns the results in the same order.
export async function fetchRwandaWeather(): Promise<DistrictWeather[]> {
  const params = new URLSearchParams({
    latitude: RWANDA_DISTRICTS.map((d) => d.lat).join(","),
    longitude: RWANDA_DISTRICTS.map((d) => d.lon).join(","),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
    timezone: "Africa/Kigali",
  });
  const response = await request(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Rwanda weather is temporarily unavailable.");

  const body = await response.json();
  const locations: { current?: OpenMeteoCurrent }[] = Array.isArray(body) ? body : [body];
  if (locations.length !== RWANDA_DISTRICTS.length) {
    throw new Error("Rwanda weather data was incomplete. Please refresh.");
  }

  return RWANDA_DISTRICTS.map((district, index) => {
    const current = locations[index]?.current;
    if (!current || typeof current.temperature_2m !== "number") {
      throw new Error(`Weather is missing for ${district.name}. Please refresh.`);
    }
    const [description, icon, iconCode] = weatherCode(current.weather_code);
    return {
      name: district.name,
      province: district.province,
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      precipitation: Math.round(current.precipitation * 10) / 10,
      description,
      icon,
      iconCode,
    };
  });
}
