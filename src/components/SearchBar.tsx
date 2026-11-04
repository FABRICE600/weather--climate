import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return; // empty input guard; App also validates
    onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a city name..."
          aria-label="City name"
          autoComplete="off"
          className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-12 pr-4 text-base text-white placeholder-white/50 outline-none backdrop-blur-md transition-all duration-200 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
        ) : (
          <Search className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{loading ? "Searching" : "Search"}</span>
      </button>
    </form>
  );
}
