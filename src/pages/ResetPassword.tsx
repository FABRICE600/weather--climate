import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthCard, { FormMessage, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return <AuthCard title="Checking your link" subtitle="One moment..."><p className="text-center text-sm text-white/60">Verifying reset link...</p></AuthCard>;
  }

  if (!user) {
    return (
      <AuthCard
        title="Link expired"
        subtitle="This password reset link is invalid or has already been used."
        footer={<Link to="/forgot-password" className="text-sky-300 hover:text-sky-200">Request a new link</Link>}
      >
        <p className="text-center text-sm text-white/60">Reset links expire after a short time for your security.</p>
      </AuthCard>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError("Could not update your password. Please request a new link.");
      return;
    }
    setDone(true);
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Enter a new password for your account."
      footer={done ? <Link to="/" className="text-sky-300 hover:text-sky-200">Continue to the weather app</Link> : undefined}
    >
      {done ? (
        <FormMessage tone="success">Your password has been updated.</FormMessage>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            New password <span className="text-white/40">(at least 8 characters)</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} autoComplete="new-password" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Confirm new password
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={authInputClass} autoComplete="new-password" />
          </label>
          <button type="submit" disabled={submitting} className={authButtonClass}>
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
