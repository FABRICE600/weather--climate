// Derives a weather "scene" from the provider-native icon code so the UI can
// theme its background to match the actual conditions (clear sky, rain, storm,
// fog, snow, night, etc.).
//
// OpenWeather icon codes: https://openweathermap.org/weather-conditions
//   Format: 2-digit condition + d (day) / n (night), e.g. "01d", "10n", "11d"
// Open-Meteo fallback uses "wmo_<code>" which we map to a non-night scene.

export type SceneId =
  | "clear-day"
  | "clear-night"
  | "cloudy-day"
  | "cloudy-night"
  | "rain"
  | "storm"
  | "snow"
  | "fog";

export interface WeatherScene {
  id: SceneId;
  label: string;
  // Tailwind gradient classes for the page background
  bgGradient: string;
  // Accent colors for decorative blobs
  blob1: string;
  blob2: string;
  blob3: string;
  // Whether it's a night scene (drives star field, moon, etc.)
  isNight: boolean;
  // Whether to show animated rain
  hasRain: boolean;
  // Whether to show animated snow
  hasSnow: boolean;
  // Whether to show a star field (night scenes)
  hasStars: boolean;
  // Whether to show lightning flashes
  hasLightning: boolean;
  // Whether to show a sun glow
  hasSun: boolean;
}

const SCENES: Record<SceneId, WeatherScene> = {
  "clear-day": {
    id: "clear-day",
    label: "Clear sky",
    bgGradient: "from-sky-500 via-sky-600 to-blue-800",
    blob1: "bg-amber-300/30",
    blob2: "bg-sky-300/25",
    blob3: "bg-cyan-200/20",
    isNight: false,
    hasRain: false,
    hasSnow: false,
    hasStars: false,
    hasLightning: false,
    hasSun: true,
  },
  "clear-night": {
    id: "clear-night",
    label: "Clear night",
    bgGradient: "from-slate-950 via-indigo-950 to-slate-900",
    blob1: "bg-indigo-500/20",
    blob2: "bg-violet-500/10",
    blob3: "bg-blue-600/10",
    isNight: true,
    hasRain: false,
    hasSnow: false,
    hasStars: true,
    hasLightning: false,
    hasSun: false,
  },
  "cloudy-day": {
    id: "cloudy-day",
    label: "Cloudy",
    bgGradient: "from-slate-600 via-slate-700 to-slate-800",
    blob1: "bg-slate-400/25",
    blob2: "bg-gray-400/15",
    blob3: "bg-slate-500/10",
    isNight: false,
    hasRain: false,
    hasSnow: false,
    hasStars: false,
    hasLightning: false,
    hasSun: false,
  },
  "cloudy-night": {
    id: "cloudy-night",
    label: "Cloudy night",
    bgGradient: "from-slate-900 via-slate-800 to-slate-950",
    blob1: "bg-slate-500/20",
    blob2: "bg-gray-600/15",
    blob3: "bg-slate-700/10",
    isNight: true,
    hasRain: false,
    hasSnow: false,
    hasStars: true,
    hasLightning: false,
    hasSun: false,
  },
  rain: {
    id: "rain",
    label: "Rainy",
    bgGradient: "from-slate-700 via-slate-800 to-blue-950",
    blob1: "bg-blue-500/20",
    blob2: "bg-slate-500/15",
    blob3: "bg-cyan-700/10",
    isNight: false,
    hasRain: true,
    hasSnow: false,
    hasStars: false,
    hasLightning: false,
    hasSun: false,
  },
  storm: {
    id: "storm",
    label: "Thunderstorm",
    bgGradient: "from-slate-900 via-slate-950 to-indigo-950",
    blob1: "bg-indigo-600/20",
    blob2: "bg-slate-700/15",
    blob3: "bg-violet-800/10",
    isNight: true,
    hasRain: true,
    hasSnow: false,
    hasStars: false,
    hasLightning: true,
    hasSun: false,
  },
  snow: {
    id: "snow",
    label: "Snowy",
    bgGradient: "from-sky-200 via-slate-300 to-slate-500",
    blob1: "bg-white/30",
    blob2: "bg-sky-200/25",
    blob3: "bg-slate-300/20",
    isNight: false,
    hasRain: false,
    hasSnow: true,
    hasStars: false,
    hasLightning: false,
    hasSun: false,
  },
  fog: {
    id: "fog",
    label: "Foggy",
    bgGradient: "from-slate-500 via-slate-600 to-slate-700",
    blob1: "bg-slate-300/20",
    blob2: "bg-gray-400/15",
    blob3: "bg-slate-500/10",
    isNight: false,
    hasRain: false,
    hasSnow: false,
    hasStars: false,
    hasLightning: false,
    hasSun: false,
  },
};

// Map OpenWeather icon codes to scene IDs.
function owCodeToScene(code: string): SceneId {
  const cond = code.slice(0, 2);
  const isNight = code.endsWith("n");
  switch (cond) {
    case "01":
      return isNight ? "clear-night" : "clear-day";
    case "02":
    case "03":
    case "04":
      return isNight ? "cloudy-night" : "cloudy-day";
    case "09":
    case "10":
      return "rain";
    case "11":
      return "storm";
    case "13":
      return "snow";
    case "50":
      return "fog";
    default:
      return isNight ? "cloudy-night" : "cloudy-day";
  }
}

// Map Open-Meteo WMO codes to scene IDs (no day/night distinction available
// from the code alone, so we fall back to local time check via the description
// icon emoji which already encodes day/night for some codes).
function wmoCodeToScene(rawCode: string): SceneId {
  const match = rawCode.match(/^wmo_(\d+)$/);
  if (!match) return "clear-day";
  const code = parseInt(match[1], 10);
  if (code === 0 || code === 1) return "clear-day";
  if (code === 2 || code === 3) return "cloudy-day";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "cloudy-day";
}

export function getWeatherScene(iconCode: string): WeatherScene {
  let sceneId: SceneId;
  if (iconCode.startsWith("wmo_")) {
    sceneId = wmoCodeToScene(iconCode);
  } else if (iconCode.length >= 3) {
    sceneId = owCodeToScene(iconCode);
  } else {
    sceneId = "clear-day";
  }
  return SCENES[sceneId];
}

// Default scene when no weather data is loaded yet.
export const DEFAULT_SCENE: WeatherScene = SCENES["clear-day"];
