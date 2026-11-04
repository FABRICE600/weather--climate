import type { CurrentWeather, WeatherAlert } from "./types";

// Inspects the current weather data and returns any relevant severe-weather
// alerts. Detection is based on description keywords (storm, thunder, heavy
// rain, etc.) and measured wind speed thresholds.
export function getWeatherAlerts(data: CurrentWeather): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const desc = data.description.toLowerCase();
  const iconCode = data.iconCode || "";

  // --- Thunderstorm (OpenWeather group 2xx, WMO 95-99) ---
  if (
    desc.includes("thunder") ||
    desc.includes("storm") ||
    iconCode.startsWith("11") ||
    iconCode === "wmo_95" ||
    iconCode === "wmo_96" ||
    iconCode === "wmo_99"
  ) {
    alerts.push({
      id: "storm",
      severity: "warning",
      title: "Severe Thunderstorm Warning",
      message:
        "Thunderstorm activity reported in this area. Seek shelter indoors and avoid open areas. Lightning and strong winds are possible.",
    });
  }

  // --- Heavy rain ---
  if (
    desc.includes("heavy rain") ||
    desc.includes("violent rain") ||
    desc.includes("heavy shower") ||
    iconCode === "wmo_65" ||
    iconCode === "wmo_82" ||
    iconCode === "wmo_67"
  ) {
    alerts.push({
      id: "heavy-rain",
      severity: "watch",
      title: "Heavy Rain Watch",
      message:
        "Heavy rainfall is reported. Be cautious of localized flooding, reduced visibility on roads, and slippery conditions.",
    });
  }

  // --- Freezing rain / drizzle ---
  if (
    desc.includes("freezing rain") ||
    desc.includes("freezing drizzle") ||
    iconCode === "wmo_66" ||
    iconCode === "wmo_67" ||
    iconCode === "wmo_56" ||
    iconCode === "wmo_57"
  ) {
    alerts.push({
      id: "freezing",
      severity: "warning",
      title: "Freezing Rain Advisory",
      message:
        "Freezing rain reported. Roads and surfaces may be extremely slippery. Exercise caution when traveling.",
    });
  }

  // --- High winds (>= 35 km/h is notable; >= 50 is severe) ---
  if (data.windSpeed >= 50) {
    alerts.push({
      id: "high-wind",
      severity: "warning",
      title: "High Wind Warning",
      message: `Wind speeds of ${data.windSpeed} km/h are reported. Secure loose objects and avoid outdoor activities in exposed areas.`,
    });
  } else if (data.windSpeed >= 35) {
    alerts.push({
      id: "wind-advisory",
      severity: "advisory",
      title: "Wind Advisory",
      message: `Moderate wind speeds of ${data.windSpeed} km/h. Use caution outdoors.`,
    });
  }

  // --- Extreme heat (>= 35°C) ---
  if (data.temperature >= 35) {
    alerts.push({
      id: "heat",
      severity: "watch",
      title: "Extreme Heat Watch",
      message:
        "Temperatures are very high. Stay hydrated, avoid prolonged sun exposure, and check on vulnerable individuals.",
    });
  }

  // --- Extreme cold (<= 0°C with freezing keywords) ---
  if (data.temperature <= 0 && (desc.includes("snow") || desc.includes("freezing") || desc.includes("ice"))) {
    alerts.push({
      id: "cold",
      severity: "advisory",
      title: "Cold Weather Advisory",
      message:
        "Sub-zero temperatures with wintry precipitation. Dress warmly and be cautious of ice on paths and roads.",
    });
  }

  return alerts;
}
