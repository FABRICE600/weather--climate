import { getSignedInUser, supabase } from "./supabase";
import type { FavoriteEntry } from "./types";

const KEY = "weather-favorites";
const read = (): FavoriteEntry[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
const write = (items: FavoriteEntry[]) => localStorage.setItem(KEY, JSON.stringify(items));

export async function addFavorite(city: string, country: string, temperature: number, description: string, icon: string): Promise<void> {
  const user = await getSignedInUser();
  if (supabase && user) {
    const { error } = await supabase.from("favorites").upsert({ user_id: user.id, city, country, temperature, description, icon }, { onConflict: "user_id,city" });
    if (error) throw new Error("Could not save this favourite. Please try again.");
    return;
  }
  const entry: FavoriteEntry = { id: crypto.randomUUID(), city, country, temperature, description, icon, created_at: new Date().toISOString() };
  write([entry, ...read().filter((item) => item.city.toLowerCase() !== city.toLowerCase())]);
}

export async function removeFavorite(city: string): Promise<void> {
  const user = await getSignedInUser();
  if (supabase && user) { await supabase.from("favorites").delete().eq("user_id", user.id).eq("city", city); return; }
  write(read().filter((item) => item.city.toLowerCase() !== city.toLowerCase()));
}

export async function loadFavorites(): Promise<FavoriteEntry[]> {
  const user = await getSignedInUser();
  if (supabase && user) {
    const { data } = await supabase.from("favorites").select("id,city,country,temperature,description,icon,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    return (data ?? []) as FavoriteEntry[];
  }
  return read();
}

export async function isFavoriteCity(city: string): Promise<boolean> { return (await loadFavorites()).some((item) => item.city.toLowerCase() === city.toLowerCase()); }
