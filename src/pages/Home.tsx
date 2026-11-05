import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import HeaderControls from "@/components/HeaderControls";
import WeatherBackground from "@/components/WeatherBackground";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import Forecast from "@/components/Forecast";
import SearchHistory from "@/components/SearchHistory";
import FavoritesBar from "@/components/FavoritesBar";
import DistrictsSelector from "@/components/DistrictsSelector";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { fetchWeather } from "@/lib/weather";
import { saveSearch, loadHistory, clearHistory, deleteSearch } from "@/lib/history";
import { addFavorite, removeFavorite, loadFavorites } from "@/lib/favorites";
import { getWeatherAlerts } from "@/lib/alerts";
import { getWeatherScene, DEFAULT_SCENE } from "@/lib/weatherScene";
import type { CurrentWeather, DailyPoint, FavoriteEntry, HourlyPoint, SearchHistoryEntry } from "@/lib/types";

const messageOf = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong. Please try again.";

export default function Home() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [searchParams] = useSearchParams();

  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  const { unit, windUnit, setUnit } = usePreferences();
  const [darkMode, setDarkMode] = useState(false);

  // Private data is only readable while signed in, so load it per user and clear it on sign-out.
  useEffect(() => {
    if (!userId) {
      setHistory([]);
      setFavorites([]);
      return;
    }
    let active = true;
    Promise.all([loadHistory(), loadFavorites()]).then(([entries, favs]) => {
      if (!active) return;
      setHistory(entries);
      setFavorites(favs);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const isFav = !!current && favorites.some((f) => f.city === current.city);

  // Derive the weather scene for the background; dark mode overrides day/night for clear and cloudy scenes.
  const scene = useMemo(() => {
    if (!current) {
      return darkMode ? getWeatherScene("01n") : DEFAULT_SCENE;
    }
    const weatherScene = getWeatherScene(current.iconCode);
    if (darkMode && !weatherScene.isNight) {
      if (weatherScene.id === "clear-day") return getWeatherScene("01n");
      if (weatherScene.id === "cloudy-day") return getWeatherScene("04n");
    }
    if (!darkMode && weatherScene.isNight && weatherScene.id !== "storm") {
      if (weatherScene.id === "clear-night") return DEFAULT_SCENE;
      if (weatherScene.id === "cloudy-night") return getWeatherScene("04d");
    }
    return weatherScene;
  }, [current, darkMode]);

  const alerts = useMemo(() => (current ? getWeatherAlerts(current) : []), [current]);

  const runSearch = useCallback(
    async (city: string) => {
      const trimmed = city.trim();
      if (!trimmed) {
        setError("Please enter a city name.");
        setCurrent(null);
        setHourly([]);
        setDaily([]);
        return;
      }

      setLoading(true);
      setError("");
      setActionError("");

      try {
        const payload = await fetchWeather(trimmed);
        setCurrent(payload.current);
        setHourly(payload.hourly);
        setDaily(payload.daily);
        if (userId) {
          await saveSearch(payload.current);
          setHistory(await loadHistory());
        }
      } catch (err) {
        setError(messageOf(err));
        setCurrent(null);
        setHourly([]);
        setDaily([]);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Deep links such as /?city=Musanze run a search on arrival.
  const cityParam = searchParams.get("city");
  useEffect(() => {
    if (cityParam) void runSearch(cityParam);
  }, [cityParam, runSearch]);

  const handleToggleFavorite = useCallback(async () => {
    if (!current) return;
    setActionError("");
    try {
      if (isFav) {
        await removeFavorite(current.city);
      } else {
        await addFavorite(current.city, current.country, current.temperature, current.description, current.icon);
      }
      setFavorites(await loadFavorites());
    } catch (err) {
      setActionError(messageOf(err));
    }
  }, [current, isFav]);

  const handleRemoveFavorite = useCallback(async (city: string) => {
    setActionError("");
    try {
      await removeFavorite(city);
      setFavorites(await loadFavorites());
    } catch (err) {
      setActionError(messageOf(err));
    }
  }, []);

  const handleDeleteHistory = useCallback(async (id: string) => {
    setActionError("");
    try {
      await deleteSearch(id);
      setHistory((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setActionError(messageOf(err));
    }
  }, []);

  const handleClearHistory = useCallback(async () => {
    setActionError("");
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      setActionError(messageOf(err));
    }
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden text-white">
      <WeatherBackground scene={scene} />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center px-4 py-10 sm:py-14">
        <HeaderControls
          isDark={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
          unit={unit}
          onToggleUnit={() => void setUnit(unit === "C" ? "F" : "C").catch((err: unknown) => console.warn(err))}
          windUnit={windUnit}
        />

        <div className="w-full">
          <SearchBar onSearch={runSearch} loading={loading} />
        </div>

        {!user && (
          <div className="mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-md">
            <p className="text-sm text-white/70">Sign in to save favourite cities and keep your search history.</p>
            <Link to="/login" className="flex shrink-0 items-center gap-1.5 rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in
            </Link>
          </div>
        )}

        {user && (
          <div className="mt-5 w-full">
            <FavoritesBar favorites={favorites} onSelect={runSearch} onRemove={handleRemoveFavorite} loading={loading} unit={unit} />
          </div>
        )}

        <div className="mt-5 flex w-full flex-col gap-5">
          {actionError && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-3 text-sm text-red-50" role="alert">
              {actionError}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/15 bg-white/5 px-6 py-12 backdrop-blur-md">
              <Loader2 className="h-8 w-8 animate-spin text-sky-300" aria-hidden="true" />
              <p className="text-sm text-white/70">Loading weather data...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-4 backdrop-blur-md" role="alert">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden="true" />
              <p className="text-sm text-red-50">{error}</p>
            </div>
          )}

          {!loading && !error && current && (
            <>
              <WeatherCard
                data={current}
                hourly={hourly}
                isFavorite={isFav}
                onToggleFavorite={user ? handleToggleFavorite : undefined}
                unit={unit}
                alerts={alerts}
              />
              {daily.length > 0 && <Forecast days={daily} unit={unit} windUnit={windUnit} />}
            </>
          )}

          {!loading && !error && !current && (
            <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center backdrop-blur-md">
              <span className="text-5xl" aria-hidden="true">🌤️</span>
              <p className="text-sm text-white/60">Search for a city above to get started.</p>
            </div>
          )}

          <DistrictsSelector onSelect={runSearch} loading={loading} />

          {user && (
            <SearchHistory
              entries={history}
              onSelect={runSearch}
              onDelete={handleDeleteHistory}
              onClear={handleClearHistory}
              loading={loading}
              unit={unit}
            />
          )}
        </div>

        <footer className="mt-auto pt-8 text-center text-xs text-white/40">
          Weather data from Open-Meteo
        </footer>
      </main>
    </div>
  );
}
