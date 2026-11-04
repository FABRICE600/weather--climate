import { Moon, Sun, CloudSun } from "lucide-react";
import type { TempUnit } from "@/lib/units";

interface HeaderControlsProps {
  isDark: boolean;
  onToggleDark: () => void;
  unit: TempUnit;
  onToggleUnit: () => void;
}

export default function HeaderControls({
  isDark,
  onToggleDark,
  unit,
  onToggleUnit,
}: HeaderControlsProps) {
  return (
    <header className="mb-7 flex w-full flex-col items-center gap-4 text-center">
      {/* Title row */}
      <div className="flex items-center gap-3">
        <CloudSun className="h-10 w-10 text-sky-300" aria-hidden="true" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Weather App
        </h1>
      </div>
      <p className="max-w-sm text-sm text-white/60">
        Search any city or pick a Rwanda district to see real-time weather, an
        hourly trend, and a 7-day forecast.
      </p>

      {/* Controls row */}
      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={onToggleDark}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:text-white"
          aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
          aria-pressed={isDark}
        >
          {isDark ? (
            <>
              <Moon className="h-4 w-4 text-indigo-300" aria-hidden="true" />
              <span>Night</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span>Day</span>
            </>
          )}
        </button>

        {/* Unit toggle (Celsius / Fahrenheit) */}
        <div className="flex items-center rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => unit !== "C" && onToggleUnit()}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
              unit === "C"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
            aria-pressed={unit === "C"}
          >
            °C
          </button>
          <button
            type="button"
            onClick={() => unit !== "F" && onToggleUnit()}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
              unit === "F"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/70 hover:text-white"
            }`}
            aria-pressed={unit === "F"}
          >
            °F
          </button>
        </div>
      </div>
    </header>
  );
}
