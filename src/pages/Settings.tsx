import { useState, type ReactNode } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import type { TempUnit, WindUnit } from "@/lib/units";

const TEMP_OPTIONS: { value: TempUnit; label: string }[] = [
  { value: "C", label: "Celsius (°C)" },
  { value: "F", label: "Fahrenheit (°F)" },
];

const WIND_OPTIONS: { value: WindUnit; label: string }[] = [
  { value: "kmh", label: "km/h" },
  { value: "mph", label: "mph" },
  { value: "ms", label: "m/s" },
];

export default function Settings() {
  const { unit, windUnit, setUnit, setWindUnit } = usePreferences();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function changeTemperature(next: TempUnit) {
    if (next === unit) return;
    setMessage(null);
    try {
      await setUnit(next);
      setMessage({ tone: "success", text: "Temperature unit saved." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not save your setting." });
    }
  }

  async function changeWind(next: WindUnit) {
    if (next === windUnit) return;
    setMessage(null);
    try {
      await setWindUnit(next);
      setMessage({ tone: "success", text: "Wind unit saved." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not save your setting." });
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-300">Preferences</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
        <p className="text-sm text-white/60">Choose how measurements appear across the app. Changes are saved to your account.</p>
      </header>

      <section className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
        <SettingGroup title="Temperature" description="Used on the dashboard, Rwanda overview and forecasts.">
          <Segmented options={TEMP_OPTIONS} value={unit} onChange={changeTemperature} label="Temperature unit" />
        </SettingGroup>

        <SettingGroup title="Wind speed" description="Used for wind readings on weather cards.">
          <Segmented options={WIND_OPTIONS} value={windUnit} onChange={changeWind} label="Wind speed unit" />
        </SettingGroup>

        {message && (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={
              message.tone === "error"
                ? "rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-50"
                : "rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-50"
            }
          >
            {message.text}
          </p>
        )}
      </section>
    </main>
  );
}

function SettingGroup({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-sm text-white/55">{description}</p>
      </div>
      {children}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}

function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full flex-wrap gap-2 rounded-2xl bg-slate-900/60 p-1.5 sm:w-auto">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={
              active
                ? "flex-1 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition sm:flex-none"
                : "flex-1 rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white sm:flex-none"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
