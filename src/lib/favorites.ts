import type { FavoriteEntry } from "./types";

const KEY = "weather-favorites";
const read = (): FavoriteEntry[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (items: FavoriteEntry[]) => localStorage.setItem(KEY, JSON.stringify(items));

export async function addFavorite(city: string, country: string, temperature: number, description: string, icon: string): Promise<void> {
  const entry: FavoriteEntry = { id: crypto.randomUUID(), city, country, temperature, description, icon, created_at: new Date().toISOString() };
  write([entry, ...read().filter((item) => item.city.toLowerCase() !== city.toLowerCase())]);
}
export async function removeFavorite(city: string): Promise<void> { write(read().filter((item) => item.city.toLowerCase() !== city.toLowerCase())); }
export async function loadFavorites(): Promise<FavoriteEntry[]> { return read(); }
export async function isFavoriteCity(city: string): Promise<boolean> { return read().some((item) => item.city.toLowerCase() === city.toLowerCase()); }
