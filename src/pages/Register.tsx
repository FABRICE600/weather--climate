import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import AuthCard, { FormMessage, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;

export default function Register() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!USERNAME_PATTERN.test(username.trim())) {
      setError("Username must be 3-30 characters: letters, numbers or underscores.");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username: username.trim(), full_name: fullName.trim() },
      },
    });
    setSubmitting(false);

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("An account with this email already exists.");
      } else if (signUpError.message.toLowerCase().includes("database error")) {
        setError("That username may already be taken. Please choose another.");
      } else {
        setError("Could not create your account. Please try again.");
      }
      return;
    }
    if (!data.session) setCreated(true);
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Save favourite cities and keep your search history in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-sky-300 hover:text-sky-200">Sign in</Link>
        </>
      }
    >
      {created ? (
        <FormMessage tone="success">
          Account created. Check your inbox to confirm your email, then sign in.
        </FormMessage>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} className={authInputClass} placeholder="kigali_walker" autoComplete="username" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Full name <span className="text-white/40">(optional)</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={authInputClass} autoComplete="name" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClass} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Password <span className="text-white/40">(at least 8 characters)</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} autoComplete="new-password" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Confirm password
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={authInputClass} autoComplete="new-password" />
          </label>
          <button type="submit" disabled={submitting} className={authButtonClass}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
