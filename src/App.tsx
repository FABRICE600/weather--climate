import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import HeaderControls from "@/components/HeaderControls";
import WeatherBackground from "@/components/WeatherBackground";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import Forecast from "@/components/Forecast";
import SearchHistory from "@/components/SearchHistory";
import FavoritesBar from "@/components/FavoritesBar";
import DistrictsSelector from "@/components/DistrictsSelector";
import { fetchWeather } from "@/lib/weather";
import { saveSearch, loadHistory, clearHistory, deleteSearch } from "@/lib/history";
import {
  addFavorite,
  removeFavorite,
  loadFavorites,
} from "@/lib/favorites";
import { getWeatherAlerts } from "@/lib/alerts";
import { getWeatherScene, DEFAULT_SCENE } from "@/lib/weatherScene";
import type { TempUnit } from "@/lib/units";
import type {
  CurrentWeather,
  DailyPoint,
  FavoriteEntry,
  HourlyPoint,
  SearchHistoryEntry,
} from "@/lib/types";

export default function App() {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [isFav, setIsFav] = useState(false);

  // User preferences
  const [unit, setUnit] = useState<TempUnit>("C");
  const [darkMode, setDarkMode] = useState(false);

  // Load recent searches + favorites once on mount.
  useEffect(() => {
    (async () => {
      const [entries, favs] = await Promise.all([loadHistory(), loadFavorites()]);
      setHistory(entries);
      setFavorites(favs);
    })();
  }, []);

  // Derive the weather scene for the background. When dark mode is toggled and
  // there's no weather data, we flip between a day and night default. When
  // weather data is loaded, the scene follows the actual conditions — but if
  // the user explicitly toggles dark mode, we override to a night/day variant.
  const scene = useMemo(() => {
    if (!current) {
      return darkMode ? getWeatherScene("01n") : DEFAULT_SCENE;
    }
    const weatherScene = getWeatherScene(current.iconCode);
    // If the user toggles dark mode, override to night for clear/cloudy scenes.
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

  // Compute severe weather alerts for the current weather.
  const alerts = useMemo(
    () => (current ? getWeatherAlerts(current) : []),
    [current]
  );

  const refreshFavorites = useCallback(async () => {
    const favs = await loadFavorites();
    setFavorites(favs);
  }, []);

  const runSearch = useCallback(
    async (city: string) => {
      const trimmed = city.trim();
      if (!trimmed) {
        setError("Please enter a city name.");
        setCurrent(null);
        setHourly([]);
        setDaily([]);
        setIsFav(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const payload = await fetchWeather(trimmed);
        setCurrent(payload.current);
        setHourly(payload.hourly);
        setDaily(payload.daily);

        setIsFav(favorites.some((f) => f.city === payload.current.city));

        await saveSearch(payload.current);
        const entries = await loadHistory();
        setHistory(entries);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);
        setCurrent(null);
        setHourly([]);
        setDaily([]);
        setIsFav(false);
      } finally {
        setLoading(false);
      }
    },
    [favorites]
  );

  const handleToggleFavorite = useCallback(async () => {
    if (!current) return;
    if (isFav) {
      await removeFavorite(current.city);
      setIsFav(false);
    } else {
      await addFavorite(
        current.city,
        current.country,
        current.temperature,
        current.description,
        current.icon
      );
      setIsFav(true);
    }
    await refreshFavorites();
  }, [current, isFav, refreshFavorites]);

  const handleRemoveFavorite = useCallback(
    async (city: string) => {
      await removeFavorite(city);
      if (current?.city === city) setIsFav(false);
      await refreshFavorites();
    },
    [current, refreshFavorites]
  );

  const handleDeleteHistory = useCallback(async (id: string) => {
    await deleteSearch(id);
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Animated weather-condition background */}
      <WeatherBackground scene={scene} />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center px-4 py-10 sm:py-14">
        {/* Header with dark mode + unit toggles */}
        <HeaderControls
          isDark={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
          unit={unit}
          onToggleUnit={() => setUnit((u) => (u === "C" ? "F" : "C"))}
        />

        {/* Search */}
        <div className="w-full">
          <SearchBar onSearch={runSearch} loading={loading} />
        </div>

        {/* Favorites bar */}
        <div className="mt-5 w-full">
          <FavoritesBar
            favorites={favorites}
            onSelect={runSearch}
            onRemove={handleRemoveFavorite}
            loading={loading}
            unit={unit}
          />
        </div>

        {/* States */}
        <div className="mt-5 flex w-full flex-col gap-5">
          {loading && (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/15 bg-white/5 px-6 py-12 backdrop-blur-md">
              <Loader2 className="h-8 w-8 animate-spin text-sky-300" aria-hidden="true" />
              <p className="text-sm text-white/70">Loading weather data...</p>
            </div>
          )}

          {!loading && error && (
            <div
              className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-4 backdrop-blur-md"
              role="alert"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-300"
                aria-hidden="true"
              />
              <p className="text-sm text-red-50">{error}</p>
            </div>
          )}

          {!loading && !error && current && (
            <>
              <WeatherCard
                data={current}
                hourly={hourly}
                isFavorite={isFav}
                onToggleFavorite={handleToggleFavorite}
                unit={unit}
                alerts={alerts}
              />
              {daily.length > 0 && <Forecast days={daily} unit={unit} />}
            </>
          )}

          {!loading && !error && !current && (
            <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center backdrop-blur-md">
              <span className="text-5xl" aria-hidden="true">
                🌤️
              </span>
              <p className="text-sm text-white/60">
                Search for a city above to get started.
              </p>
            </div>
          )}

          {/* Districts */}
          <DistrictsSelector onSelect={runSearch} loading={loading} />

          {/* History */}
          <SearchHistory
            entries={history}
            onSelect={runSearch}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
            loading={loading}
            unit={unit}
          />
        </div>

        <footer className="mt-auto pt-8 text-center text-xs text-white/40">
          Powered by OpenWeather · Data fetched through a secure server proxy
        </footer>
      </main>
    </div>
  );
}
