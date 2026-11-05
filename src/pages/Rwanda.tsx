import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";
import DistrictCard from "@/components/rwanda/DistrictCard";
import { usePreferences } from "@/context/PreferencesContext";
import { fetchRwandaWeather, type DistrictWeather } from "@/lib/rwandaWeather";
import { RWANDA_PROVINCES } from "@/lib/rwandaDistricts";
import { tempValue } from "@/lib/units";

const PROVINCE_LABELS: Record<(typeof RWANDA_PROVINCES)[number], string> = {
  Kigali: "Kigali City",
  Northern: "Northern Province",
  Southern: "Southern Province",
  Eastern: "Eastern Province",
  Western: "Western Province",
};

export default function Rwanda() {
  const { unit } = usePreferences();
  const [weather, setWeather] = useState<DistrictWeather[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchRwandaWeather()
      .then((data) => {
        if (!active) return;
        setWeather(data);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setErrorMessage(err instanceof Error ? err.message : "Rwanda weather could not be loaded.");
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    const visible = weather.filter(
      (d) => !term || d.name.toLowerCase().includes(term) || d.province.toLowerCase().includes(term)
    );
    return RWANDA_PROVINCES.map((province) => ({
      province,
      items: visible.filter((d) => d.province === province),
    })).filter((group) => group.items.length > 0);
  }, [weather, query]);

  const overview = useMemo(() => {
    if (weather.length === 0) return null;
    const warmest = weather.reduce((a, b) => (b.temperature > a.temperature ? b : a));
    const coolest = weather.reduce((a, b) => (b.temperature < a.temperature ? b : a));
    const wettest = weather.reduce((a, b) => (b.precipitation > a.precipitation ? b : a));
    const average = weather.reduce((sum, d) => sum + d.temperature, 0) / weather.length;
    return { warmest, coolest, wettest, average };
  }, [weather]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-300">Rwanda</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Rwanda weather by district</h1>
        <p className="max-w-2xl text-sm text-white/60">
          Live conditions for all 30 districts, grouped by province. Select a district to see its full forecast.
        </p>
      </header>

      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-sky-300" aria-hidden="true" />
          <p className="text-sm text-white/70">Loading weather for all districts...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-400/30 bg-red-500/15 p-5" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden="true" />
            <p className="text-sm text-red-50">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/25"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {status === "ready" && overview && (
        <>
          <section aria-label="Rwanda overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="National average" value={`${tempValue(overview.average, unit)}°${unit}`} />
            <Stat label="Warmest" value={`${overview.warmest.name} · ${tempValue(overview.warmest.temperature, unit)}°${unit}`} />
            <Stat label="Coolest" value={`${overview.coolest.name} · ${tempValue(overview.coolest.temperature, unit)}°${unit}`} />
            <Stat label="Most rain now" value={`${overview.wettest.name} · ${overview.wettest.precipitation} mm`} />
          </section>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search districts or provinces"
              aria-label="Search districts"
              className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-white/40 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          {groups.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-white/60">
              No district matches &ldquo;{query.trim()}&rdquo;.
            </p>
          )}

          {groups.map((group) => (
            <section key={group.province} aria-labelledby={`province-${group.province}`} className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <h2 id={`province-${group.province}`} className="text-xl font-semibold">
                  {PROVINCE_LABELS[group.province]}
                </h2>
                <span className="text-xs text-white/50">{group.items.length} districts</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((district) => (
                  <DistrictCard key={district.name} district={district} unit={unit} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
