import { History, RotateCw, Trash2, X } from "lucide-react";
import type { SearchHistoryEntry } from "@/lib/types";
import { tempValue, type TempUnit } from "@/lib/units";

interface SearchHistoryProps {
  entries: SearchHistoryEntry[];
  onSelect: (city: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  loading: boolean;
  unit: TempUnit;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SearchHistory({
  entries,
  onSelect,
  onDelete,
  onClear,
  loading,
  unit,
}: SearchHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <section
      className="w-full rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-md sm:p-6"
      aria-label="Recent searches"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <History className="h-4 w-4" aria-hidden="true" />
          Recent searches
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear all
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all duration-200 hover:border-white/25 hover:bg-white/10"
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => onSelect(entry.city)}
              className="flex flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-2xl" aria-hidden="true">
                {entry.icon || "📍"}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-white">
                  {entry.city}
                  {entry.country ? (
                    <span className="ml-1.5 text-white/50">{entry.country}</span>
                  ) : null}
                </span>
                <span className="block text-xs text-white/50">
                  {entry.description
                    ? `${entry.description} · ${
                        entry.temperature != null
                          ? `${tempValue(entry.temperature, unit)}°${unit}`
                          : "--"
                      }`
                    : "No data"}{" "}
                  · {relativeTime(entry.created_at)}
                </span>
              </span>
              <RotateCw
                className="h-4 w-4 text-white/30 transition-colors group-hover:text-white/70"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="rounded-full p-1.5 text-white/30 transition-colors hover:bg-red-500/20 hover:text-red-300"
              title="Delete this entry"
              aria-label={`Delete ${entry.city} from history`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
