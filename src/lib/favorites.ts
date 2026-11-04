import { supabase } from "./supabase";
import type { FavoriteEntry } from "./types";

// Add a city to favorites (upsert so re-favoriting updates the snapshot).
export async function addFavorite(
  city: string,
  country: string,
  temperature: number,
  description: string,
  icon: string
): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .upsert(
      { city, country, temperature, description, icon },
      { onConflict: "city" }
    );
  if (error) {
    console.warn("Failed to add favorite:", error.message);
  }
}

// Remove a city from favorites.
export async function removeFavorite(city: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("city", city);
  if (error) {
    console.warn("Failed to remove favorite:", error.message);
  }
}

// Load all favorites, newest first.
export async function loadFavorites(): Promise<FavoriteEntry[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id, city, country, temperature, description, icon, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("Failed to load favorites:", error.message);
    return [];
  }
  return (data ?? []) as FavoriteEntry[];
}

// Check whether a city is currently in favorites.
export async function isFavoriteCity(city: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("city", city)
    .maybeSingle();
  if (error) {
    console.warn("Failed to check favorite:", error.message);
    return false;
  }
  return !!data;
}
