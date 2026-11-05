import { Link, useNavigate } from "react-router-dom";
import { CloudSun, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SiteNav() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.warn(err);
    }
  }

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <CloudSun className="h-6 w-6 text-sky-300" aria-hidden="true" />
          <span>Weather &amp; Climate</span>
        </Link>

        <div className="flex items-center gap-2 text-sm">
          {!loading && user && (
            <>
              <span className="hidden max-w-[12rem] truncate text-white/60 sm:inline">{user.email}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 font-medium text-white/80 transition hover:text-white">
                Sign in
              </Link>
              <Link to="/register" className="rounded-full bg-sky-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-sky-300">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
