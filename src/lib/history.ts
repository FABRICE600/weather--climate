import { supabase } from "./supabase";
import type { CurrentWeather, SearchHistoryEntry } from "./types";

export async function saveSearch(data: CurrentWeather): Promise<void> {
  const { error } = await supabase.from("search_history").insert({
    city: data.city,
    country: data.country,
    temperature: data.temperature,
    description: data.description,
    icon: data.icon,
  });
  if (error) console.warn("Failed to save search:", error.message);
}

export async function loadHistory(limit = 6): Promise<SearchHistoryEntry[]> {
  const { data, error } = await supabase
    .from("search_history")
    .select("id, city, country, temperature, description, icon, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("Failed to load search history:", error.message);
    return [];
  }
  return (data ?? []) as SearchHistoryEntry[];
}

export async function deleteSearch(id: string): Promise<void> {
  const { error } = await supabase.from("search_history").delete().eq("id", id);
  if (error) throw new Error("Could not delete this entry. Please try again.");
}

export async function clearHistory(): Promise<void> {
  const { error } = await supabase
    .from("search_history")
    .delete()
    .not("id", "is", null);
  if (error) throw new Error("Could not clear your search history. Please try again.");
}
