import type { CurrentWeather, SearchHistoryEntry } from "./types";

const KEY = "weather-search-history";
const read = (): SearchHistoryEntry[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (items: SearchHistoryEntry[]) => localStorage.setItem(KEY, JSON.stringify(items));

export async function saveSearch(data: CurrentWeather): Promise<void> {
  const entry: SearchHistoryEntry = { id: crypto.randomUUID(), city: data.city, country: data.country, temperature: data.temperature, description: data.description, icon: data.icon, created_at: new Date().toISOString() };
  write([entry, ...read().filter((item) => item.city.toLowerCase() !== data.city.toLowerCase())].slice(0, 20));
}

export async function loadHistory(limit = 6): Promise<SearchHistoryEntry[]> { return read().slice(0, limit); }
export async function deleteSearch(id: string): Promise<void> { write(read().filter((item) => item.id !== id)); }
export async function clearHistory(): Promise<void> { write([]); }
