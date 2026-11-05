import { Link } from "react-router-dom";
import { tempValue, type TempUnit } from "@/lib/units";
import type { DistrictWeather } from "@/lib/rwandaWeather";

interface DistrictCardProps {
  district: DistrictWeather;
  unit: TempUnit;
}

export default function DistrictCard({ district, unit }: DistrictCardProps) {
  return (
    <Link
      to={`/?city=${encodeURIComponent(district.name)}`}
      className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-white/10"
      aria-label={`${district.name} district weather`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{district.name}</p>
          <p className="truncate text-xs text-white/55">{district.description}</p>
        </div>
        <span className="text-3xl" aria-hidden="true">{district.icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-light text-white">
          {tempValue(district.temperature, unit)}°{unit}
        </span>
        <div className="text-right text-xs text-white/60">
          <p>Humidity {district.humidity}%</p>
          <p>Rain {district.precipitation} mm</p>
        </div>
      </div>
    </Link>
  );
}
