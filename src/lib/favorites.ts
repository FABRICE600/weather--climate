import { supabase } from "./supabase";
import type { FavoriteEntry } from "./types";

// Owner is filled in by the database default (the signed-in user).
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
      { onConflict: "user_id,city", ignoreDuplicates: true }
    );
  if (error) throw new Error("Could not save this favourite. Please try again.");
}

export async function removeFavorite(city: string): Promise<void> {
  const { error } = await supabase.from("favorites").delete().eq("city", city);
  if (error) throw new Error("Could not remove this favourite. Please try again.");
}

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
