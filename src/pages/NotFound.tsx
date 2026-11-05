import { Link } from "react-router-dom";
import { CloudSun } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-4 text-center">
      <CloudSun className="h-12 w-12 text-sky-300" aria-hidden="true" />
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-sm text-white/60">The page you are looking for does not exist.</p>
      <Link to="/" className="rounded-full bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
        Back to weather
      </Link>
    </div>
  );
}
