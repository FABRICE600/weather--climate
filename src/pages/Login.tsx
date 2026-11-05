import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import AuthCard, { FormMessage, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Email or password is incorrect."
          : "Could not sign you in. Please try again."
      );
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to save favourites and your search history."
      footer={
        <>
          <Link to="/forgot-password" className="text-sky-300 hover:text-sky-200">Forgot password?</Link>
          <span className="mx-2 text-white/30">|</span>
          <Link to="/register" className="text-sky-300 hover:text-sky-200">Create account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClass} placeholder="you@example.com" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} />
        </label>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
