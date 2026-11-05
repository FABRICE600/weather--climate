import {
  AlertTriangle,
  Droplets,
  Gauge,
  MapPin,
  Star,
  Thermometer,
  Wind,
} from "lucide-react";
import type { CurrentWeather, HourlyPoint, WeatherAlert } from "@/lib/types";
import { formatTemp, type TempUnit } from "@/lib/units";
import HourlyChart from "./HourlyChart";

interface WeatherCardProps {
  data: CurrentWeather;
  hourly: HourlyPoint[];
  isFavorite: boolean;
  onToggleFavorite?: () => void;
  unit: TempUnit;
  alerts: WeatherAlert[];
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-4 text-center backdrop-blur-sm transition-colors hover:bg-white/15">
      <div className="text-white/70">{icon}</div>
      <span className="mt-1 text-2xl font-semibold text-white">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-white/60">
        {label}
      </span>
    </div>
  );
}

const SEVERITY_STYLES: Record<
  WeatherAlert["severity"],
  { border: string; bg: string; icon: string; text: string }
> = {
  warning: {
    border: "border-red-400/50",
    bg: "bg-red-500/20",
    icon: "text-red-300",
    text: "text-red-50",
  },
  watch: {
    border: "border-amber-400/50",
    bg: "bg-amber-500/15",
    icon: "text-amber-300",
    text: "text-amber-50",
  },
  advisory: {
    border: "border-sky-400/40",
    bg: "bg-sky-500/15",
    icon: "text-sky-300",
    text: "text-sky-50",
  },
};

export default function WeatherCard({
  data,
  hourly,
  isFavorite,
  onToggleFavorite,
  unit,
  alerts,
}: WeatherCardProps) {
  const locationLabel = [data.city, data.countryName || data.country]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      className="w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      role="region"
      aria-label="Weather details"
    >
      {/* Severe weather alert banners */}
      {alerts.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {alerts.map((alert) => {
            const s = SEVERITY_STYLES[alert.severity];
            return (
              <div
                key={alert.id}
                className={`animate-slide-down flex items-start gap-3 rounded-2xl border ${s.border} ${s.bg} px-4 py-3 backdrop-blur-md`}
                role="alert"
              >
                <AlertTriangle
                  className={`mt-0.5 h-5 w-5 shrink-0 ${s.icon}`}
                  aria-hidden="true"
                />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${s.text}`}>{alert.title}</p>
                  <p className={`mt-0.5 text-xs leading-relaxed ${s.text} opacity-90`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Favorite button (top-right) */}
      {onToggleFavorite && (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            isFavorite
              ? "bg-amber-400/20 text-amber-200 hover:bg-amber-400/30"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={`h-4 w-4 ${isFavorite ? "fill-amber-300 text-amber-300" : ""}`}
            aria-hidden="true"
          />
          {isFavorite ? "Favorited" : "Add to favorites"}
        </button>
      </div>
      )}

      {/* Header: location + big icon */}
      <div className="-mt-2 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-white/80">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium uppercase tracking-widest">
            {locationLabel}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <span className="text-7xl leading-none drop-shadow-lg sm:text-8xl" aria-hidden="true">
            {data.icon}
          </span>
          <span className="text-7xl font-extralight text-white drop-shadow-lg sm:text-8xl">
            {formatTemp(data.temperature, unit).replace(/°[CF]$/, "")}
            <span className="align-top text-3xl font-light">°{unit}</span>
          </span>
        </div>

        <p className="text-lg font-medium capitalize text-white/90">
          {data.description}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-white/60">
          <Thermometer className="h-4 w-4" aria-hidden="true" />
          Feels like {formatTemp(data.feelsLike, unit)}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          icon={<Droplets className="h-5 w-5" />}
          label="Humidity"
          value={`${data.humidity}%`}
        />
        <Stat
          icon={<Wind className="h-5 w-5" />}
          label="Wind"
          value={`${data.windSpeed} km/h`}
        />
        <Stat
          icon={<Gauge className="h-5 w-5" />}
          label="Pressure"
          value={`${data.pressure} hPa`}
        />
      </div>

      {/* Hourly trend chart */}
      {hourly.length > 0 && <HourlyChart data={hourly} unit={unit} />}

      {data.timezone && (
        <p className="mt-5 text-center text-xs text-white/40">
          Local time zone: {data.timezone}
        </p>
      )}
    </section>
  );
}
