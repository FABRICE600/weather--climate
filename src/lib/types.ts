export interface CurrentWeather {
  city: string;
  country: string;
  countryName: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string; // emoji
  iconCode: string; // provider-native code
  humidity: number;
  windSpeed: number;
  pressure: number;
  timezone: string;
  lat: number;
  lon: number;
}

export interface HourlyPoint {
  time: string; // e.g. "14:00"
  temp: number;
}

export interface DailyPoint {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  description: string;
  icon: string; // emoji
  iconCode: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherPayload {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
}

export interface WeatherResponse {
  success: boolean;
  data?: WeatherPayload;
  error?: string;
  provider?: string;
}

// Backwards-compatible alias for the search-history save path.
export type WeatherData = CurrentWeather;

export interface SearchHistoryEntry {
  id: string;
  city: string;
  country: string | null;
  temperature: number | null;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface FavoriteEntry {
  id: string;
  city: string;
  country: string | null;
  temperature: number | null;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface District {
  name: string;
  province: string;
  lat: number;
  lon: number;
}

export type AlertSeverity = "warning" | "watch" | "advisory";

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
}
