import { supabase } from "./supabase";
import type { CurrentWeather, SearchHistoryEntry } from "./types";

// Save a successful weather lookup into the search_history table.
export async function saveSearch(data: CurrentWeather): Promise<void> {
  const { error } = await supabase.from("search_history").insert({
    city: data.city,
    country: data.country,
    temperature: data.temperature,
    description: data.description,
    icon: data.icon,
  });
  if (error) {
    console.warn("Failed to save search history:", error.message);
  }
}

// Load the most recent searches (newest first).
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

// Remove a single search history row by id.
export async function deleteSearch(id: string): Promise<void> {
  const { error } = await supabase
    .from("search_history")
    .delete()
    .eq("id", id);
  if (error) {
    console.warn("Failed to delete search entry:", error.message);
  }
}

// Remove all search history rows.
export async function clearHistory(): Promise<void> {
  const { error } = await supabase
    .from("search_history")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.warn("Failed to clear search history:", error.message);
  }
}
