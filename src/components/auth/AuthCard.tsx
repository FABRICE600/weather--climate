import type { ReactNode } from "react";
import { CloudSun } from "lucide-react";

export const authInputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20";

export const authButtonClass =
  "w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60";

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const styles =
    tone === "error"
      ? "border-red-400/30 bg-red-500/15 text-red-50"
      : "border-emerald-400/30 bg-emerald-500/15 text-emerald-50";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <CloudSun className="h-10 w-10 text-sky-300" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-white/60">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-white/60">{footer}</div>}
      </div>
    </div>
  );
}
