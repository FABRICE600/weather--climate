import { WEATHER_ENDPOINT } from "./supabase";
import type { WeatherPayload, WeatherResponse } from "./types";

// Fetch weather for a city from the secure backend (Supabase Edge Function).
// This mirrors the React -> Node.js/Express flow: the frontend calls our
// backend proxy, which in turn calls the real weather API (OpenWeather when an
// API key is configured, otherwise Open-Meteo). The API key lives only on the
// server, never in the browser.
export async function fetchWeather(city: string): Promise<WeatherPayload> {
  const url = `${WEATHER_ENDPOINT}?city=${encodeURIComponent(city)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  let body: WeatherResponse;
  try {
    body = (await response.json()) as WeatherResponse;
  } catch {
    throw new Error("Unable to understand the server response.");
  }

  if (!response.ok || !body.success) {
    const message = body.error || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  if (!body.data) {
    throw new Error("No weather data returned.");
  }

  return body.data;
}
