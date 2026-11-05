import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthCard, { FormMessage, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (resetError) {
      setError("Could not send the reset email. Please try again shortly.");
      return;
    }
    setSent(true);
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your account email and we will send you a reset link."
      footer={<Link to="/login" className="text-sky-300 hover:text-sky-200">Back to sign in</Link>}
    >
      {sent ? (
        <FormMessage tone="success">
          If an account exists for that email, a reset link is on its way.
        </FormMessage>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClass} placeholder="you@example.com" autoComplete="email" />
          </label>
          <button type="submit" disabled={submitting} className={authButtonClass}>
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
