/*
# Add user profiles and make favourites and search history private per user

## Summary
Sign-in accounts are added. Each user gets a profile row created automatically
at sign-up. Favourites and search history become private: each row belongs to
one user and only that user can read or change it. Anonymous (signed-out)
access to these two tables is removed.

## 1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users, deleted with the user)
  - `username` (unique, 3-30 letters, numbers or underscores)
  - `full_name`, `avatar_url`, `country`, `city` (optional text)
  - `temperature_unit` ('C' or 'F', default 'C')
  - `wind_unit` ('kmh', 'mph' or 'ms', default 'kmh')
  - `created_at`, `updated_at` (timestamps, updated automatically)

## 2. Modified Tables
- `favorites`: adds `user_id` (owner, defaults to the signed-in user).
  The old rule "city must be unique across everyone" is replaced by
  "city must be unique per user".
- `search_history`: adds `user_id` (owner, defaults to the signed-in user).
- Existing rows keep `user_id` empty. They are not deleted, but they are no
  longer visible to anyone through the app.

## 3. Automation
- A trigger creates a profile whenever a new account is registered.
- A trigger keeps `updated_at` current on profile changes.
- Both trigger functions are not callable by app users.

## 4. Security
- Row Level Security enabled on `profiles`, `favorites` and `search_history`.
- Users can read and change only their own profile. Only the listed profile
  fields can be changed (not the id or timestamps).
- Users can read, add and delete only their own favourites and history.
- The `anon` role loses all access to `favorites` and `search_history`.
- Old public-access policies are removed.

## Important Notes
1. No data is deleted. Legacy anonymous rows remain in the database for manual review.
2. Each policy checks `auth.uid()` against the row owner.
3. Profiles for accounts that already exist are created by the backfill step below.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE CHECK (username IS NULL OR username ~ '^[A-Za-z0-9_]{3,30}$'),
  full_name text,
  avatar_url text,
  country text,
  city text,
  temperature_unit text NOT NULL DEFAULT 'C' CHECK (temperature_unit IN ('C', 'F')),
  wind_unit text NOT NULL DEFAULT 'kmh' CHECK (wind_unit IN ('kmh', 'mph', 'ms')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    NULLIF(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (username, full_name, avatar_url, country, city, temperature_unit, wind_unit)
  ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Favourites: private per user
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_city_key;
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_city_key ON favorites (user_id, city);

DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_update_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;

REVOKE ALL ON favorites FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON favorites TO authenticated;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Search history: private per user
ALTER TABLE search_history ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS search_history_user_created_idx ON search_history (user_id, created_at DESC);

DROP POLICY IF EXISTS "anon_select_history" ON search_history;
DROP POLICY IF EXISTS "anon_insert_history" ON search_history;
DROP POLICY IF EXISTS "anon_update_history" ON search_history;
DROP POLICY IF EXISTS "anon_delete_history" ON search_history;

REVOKE ALL ON search_history FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON search_history TO authenticated;

DROP POLICY IF EXISTS "select_own_history" ON search_history;
CREATE POLICY "select_own_history" ON search_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_history" ON search_history;
CREATE POLICY "insert_own_history" ON search_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_history" ON search_history;
CREATE POLICY "delete_own_history" ON search_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
