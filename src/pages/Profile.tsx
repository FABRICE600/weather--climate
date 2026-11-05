import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/profile";

interface ProfileForm {
  username: string;
  full_name: string;
  country: string;
  city: string;
}

const EMPTY_FORM: ProfileForm = { username: "", full_name: "", country: "", city: "" };
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      username: profile.username ?? "",
      full_name: profile.full_name ?? "",
      country: profile.country ?? "",
      city: profile.city ?? "",
    });
  }, [profile]);

  if (!user) return null;

  const memberSince = new Date(user.created_at).toLocaleDateString("en", { month: "long", year: "numeric" });

  function setField(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setMessage(null);

    const username = form.username.trim();
    if (username && !USERNAME_PATTERN.test(username)) {
      setMessage({ tone: "error", text: "Usernames use 3-30 letters, numbers or underscores." });
      return;
    }

    setSaving(true);
    try {
      await updateProfile(user.id, {
        username: username || null,
        full_name: form.full_name.trim() || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
      });
      await refreshProfile();
      setMessage({ tone: "success", text: "Your profile has been saved." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not save your profile." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-300">Account</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your profile</h1>
        <p className="text-sm text-white/60">Member since {memberSince}</p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
        {!profile ? (
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Loader2 className="h-5 w-5 animate-spin text-sky-300" aria-hidden="true" />
            Loading your profile...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" id="email">
                <input id="email" value={user.email ?? ""} disabled className={inputClass + " cursor-not-allowed opacity-60"} />
              </Field>
              <Field label="Username" id="username" hint="3-30 letters, numbers or underscores">
                <input id="username" value={form.username} onChange={(e) => setField("username", e.target.value)} className={inputClass} maxLength={30} />
              </Field>
              <Field label="Full name" id="full_name">
                <input id="full_name" value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} className={inputClass} maxLength={80} />
              </Field>
              <Field label="Country" id="country">
                <input id="country" value={form.country} onChange={(e) => setField("country", e.target.value)} className={inputClass} maxLength={60} />
              </Field>
              <Field label="Home city" id="city" hint="Used as a starting point for your dashboard">
                <input id="city" value={form.city} onChange={(e) => setField("city", e.target.value)} className={inputClass} maxLength={60} />
              </Field>
            </div>

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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Save changes
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20";

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white/90">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-white/50">{hint}</p>}
    </div>
  );
}
