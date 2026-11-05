# Weather & Climate Intelligence Platform

Responsive Vite + React weather dashboard with real Open-Meteo geocoding/forecast data, Rwanda district search, hourly and 7-day forecasts, favourites, and search history.

## Environment

The app uses Supabase when a signed-in session and these public browser variables are available. Signed-out users keep local browser fallback data.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never expose a service-role or secret key in `VITE_*` variables. Supabase migrations live in `supabase/migrations` and should be applied through the connected project tooling before enabling cloud persistence.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```
