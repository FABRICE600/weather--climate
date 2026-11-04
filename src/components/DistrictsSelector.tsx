import { useState } from "react";
import { MapPinned, ChevronDown } from "lucide-react";
import { RWANDA_DISTRICTS, RWANDA_PROVINCES } from "@/lib/rwandaDistricts";

interface DistrictsSelectorProps {
  onSelect: (city: string) => void;
  loading: boolean;
}

export default function DistrictsSelector({ onSelect, loading }: DistrictsSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeProvince, setActiveProvince] = useState<string>("Kigali");

  const districts = RWANDA_DISTRICTS.filter((d) => d.province === activeProvince);

  return (
    <section
      className="w-full rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-md"
      aria-label="Rwanda districts"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
        aria-expanded={open}
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <MapPinned className="h-4 w-4" aria-hidden="true" />
          Rwanda Districts
        </h2>
        <ChevronDown
          className={`h-4 w-4 text-white/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-4">
          {/* Province tabs */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {RWANDA_PROVINCES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActiveProvince(p)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeProvince === p
                    ? "bg-white text-slate-900"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* District chips */}
          <div className="flex flex-wrap gap-2">
            {districts.map((d) => (
              <button
                key={d.name}
                type="button"
                disabled={loading}
                onClick={() => onSelect(d.name)}
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/80 transition-all duration-200 hover:border-sky-300/50 hover:bg-sky-400/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {d.name}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-white/40">
            Tap any district to see its live weather.
          </p>
        </div>
      )}
    </section>
  );
}
