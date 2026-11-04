import { Star, X } from "lucide-react";
import type { FavoriteEntry } from "@/lib/types";
import { tempValue, type TempUnit } from "@/lib/units";

interface FavoritesBarProps {
  favorites: FavoriteEntry[];
  onSelect: (city: string) => void;
  onRemove: (city: string) => void;
  loading: boolean;
  unit: TempUnit;
}

export default function FavoritesBar({
  favorites,
  onSelect,
  onRemove,
  loading,
  unit,
}: FavoritesBarProps) {
  if (favorites.length === 0) return null;

  return (
    <section
      className="w-full rounded-3xl border border-amber-300/20 bg-amber-400/5 p-5 backdrop-blur-md"
      aria-label="Favorite cities"
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-200/80">
        <Star className="h-4 w-4 fill-amber-300 text-amber-300" aria-hidden="true" />
        Favorites
      </h2>

      <div className="flex flex-wrap gap-2">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1.5 pl-3 pr-1.5 transition-colors hover:border-amber-300/40 hover:bg-amber-400/10"
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => onSelect(fav.city)}
              className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              title={`View weather for ${fav.city}`}
            >
              <span className="text-lg" aria-hidden="true">
                {fav.icon || "📍"}
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold text-white">{fav.city}</span>
                <span className="text-[10px] text-white/50">
                  {fav.temperature != null
                    ? `${tempValue(fav.temperature, unit)}°${unit}`
                    : "—"}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(fav.city)}
              className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              title={`Remove ${fav.city} from favorites`}
              aria-label={`Remove ${fav.city} from favorites`}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
