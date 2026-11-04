import { Droplets, Wind } from "lucide-react";
import type { DailyPoint } from "@/lib/types";
import { tempValue, type TempUnit } from "@/lib/units";

interface ForecastProps {
  days: DailyPoint[];
  unit: TempUnit;
}

export default function Forecast({ days, unit }: ForecastProps) {
  if (days.length === 0) return null;

  const weekMin = Math.min(...days.map((d) => tempValue(d.tempMin, unit)));
  const weekMax = Math.max(...days.map((d) => tempValue(d.tempMax, unit)));
  const weekRange = weekMax - weekMin || 1;

  return (
    <section
      className="w-full rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-md sm:p-6"
      aria-label="7-day forecast"
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/70">
        7-Day Forecast
      </h2>

      <ul className="flex flex-col divide-y divide-white/5">
        {days.map((d) => {
          const tMin = tempValue(d.tempMin, unit);
          const tMax = tempValue(d.tempMax, unit);
          const leftPct = ((tMin - weekMin) / weekRange) * 100;
          const widthPct = ((tMax - tMin) / weekRange) * 100;
          const isToday = d === days[0];

          return (
            <li
              key={d.date}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              {/* Day */}
              <span className="w-12 shrink-0 text-sm font-medium text-white/80">
                {isToday ? "Today" : d.dayName}
              </span>

              {/* Icon */}
              <span className="w-8 shrink-0 text-center text-xl" aria-hidden="true">
                {d.icon}
              </span>

              {/* Description (hidden on small screens) */}
              <span className="hidden flex-1 truncate text-xs capitalize text-white/50 sm:block">
                {d.description}
              </span>

              {/* Precip / wind mini stats (hidden on small) */}
              <span className="hidden items-center gap-1 text-xs text-sky-300/70 md:flex">
                <Droplets className="h-3 w-3" />
                {Math.round(d.precipitation * 100)}%
              </span>
              <span className="hidden items-center gap-1 text-xs text-white/40 lg:flex">
                <Wind className="h-3 w-3" />
                {d.windSpeed}
              </span>

              {/* Temp range bar */}
              <div className="relative ml-auto h-1.5 w-20 shrink-0 rounded-full bg-white/10 sm:w-28">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-300"
                  style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` }}
                />
              </div>

              {/* Temps */}
              <span className="flex w-16 shrink-0 justify-end text-sm tabular-nums">
                <span className="text-white/50">{tMin}°</span>
                <span className="px-1 text-white/30">/</span>
                <span className="font-semibold text-white">{tMax}°</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
