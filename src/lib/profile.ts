import { supabase } from "./supabase";
import type { TempUnit, WindUnit } from "./units";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  country: string | null;
  city: string | null;
  temperature_unit: TempUnit;
  wind_unit: WindUnit;
}

export type ProfileChanges = Partial<Omit<Profile, "id">>;

export async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, country, city, temperature_unit, wind_unit")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.warn("Failed to load profile:", error.message);
    return null;
  }
  return data as Profile | null;
}

export async function updateProfile(userId: string, changes: ProfileChanges): Promise<void> {
  const { error } = await supabase.from("profiles").update(changes).eq("id", userId);
  if (error) {
    if (error.code === "23505") throw new Error("That username is already taken.");
    if (error.code === "23514") throw new Error("Usernames use 3-30 letters, numbers or underscores.");
    throw new Error("Could not save your changes. Please try again.");
  }
}
