/*
# Create favorites table (single-tenant, no auth)

## Purpose
Stores the user's favorite cities for one-click access. A favorite stores the
last-known weather snapshot (temperature, description, icon) so the favorites
bar can show a quick preview without re-fetching.

## 1. New Tables
- `favorites`
  - `id` (uuid, primary key)
  - `city` (text, not null, UNIQUE) - one favorite per city name
  - `country` (text) - country code
  - `temperature` (integer) - temperature in Celsius when favorited
  - `description` (text) - weather description when favorited
  - `icon` (text) - emoji icon when favorited
  - `created_at` (timestamptz, default now())

## 2. Security
- Enable RLS on `favorites`.
- Grant CRUD to `anon` + `authenticated` so the anon-key frontend can reach it.
- Allow anon + authenticated CRUD because the data is intentionally shared/public
  (single-tenant app, no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL UNIQUE,
  country text,
  temperature integer,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON favorites TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
CREATE POLICY "anon_select_favorites" ON favorites FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_favorites" ON favorites;
CREATE POLICY "anon_update_favorites" ON favorites FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE
  TO anon, authenticated USING (true);
