/*
# Create search_history table (single-tenant, no auth)

## Purpose
Stores a history of weather searches performed in the Weather App so users can
see and re-run their recent lookups. This is a no-auth public app, so the table
is intentionally shared (single-tenant).

## 1. New Tables
- `search_history`
  - `id` (uuid, primary key)
  - `city` (text, not null) - the searched city name
  - `country` (text) - country code returned by the weather service
  - `temperature` (integer) - temperature in Celsius at search time
  - `description` (text) - weather description at search time
  - `icon` (text) - emoji icon at search time
  - `created_at` (timestamptz, default now())

## 2. Security
- Enable RLS on `search_history`.
- Grant CRUD to `anon` + `authenticated` so the anon-key frontend can reach it.
- Allow anon + authenticated CRUD because the data is intentionally shared/public
  (single-tenant app, no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text,
  temperature integer,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON search_history TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_history" ON search_history;
CREATE POLICY "anon_select_history" ON search_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_history" ON search_history;
CREATE POLICY "anon_insert_history" ON search_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_history" ON search_history;
CREATE POLICY "anon_update_history" ON search_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_history" ON search_history;
CREATE POLICY "anon_delete_history" ON search_history FOR DELETE
  TO anon, authenticated USING (true);

-- Index for ordering recent searches efficiently
CREATE INDEX IF NOT EXISTS search_history_created_at_idx
  ON search_history (created_at DESC);
