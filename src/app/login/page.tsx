"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/chat";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    errorParam === "auth" ? { type: "error", text: "Authentication failed. Please try again." } : null
  );

  const supabase = createClient();

  function GoogleIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    window.location.href = next;
  }

  async function handleSignInWithGoogle() {
    setLoading(true);
    setMessage(null);
    // Use NEXT_PUBLIC_APP_URL in production so OAuth redirects to your deployed domain, not localhost
    const baseUrl =
      typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
        : process.env.NEXT_PUBLIC_APP_URL ?? "";
    const redirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    }
    // If successful, Supabase redirects the user to Google; no further action here
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "success",
      text: "Check your email for the confirmation link.",
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-xl font-semibold">
            Tambo{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Canvas
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-white/60">
            Sign in to access the diagram editor.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                "mt-1 block w-full rounded-lg border bg-white/5 px-3 py-2 text-white",
                "border-white/10 placeholder:text-white/40 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              )}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={cn(
                "mt-1 block w-full rounded-lg border bg-white/5 px-3 py-2 text-white",
                "border-white/10 placeholder:text-white/40 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              )}
              placeholder="••••••••"
            />
          </div>

          {message && (
            <p className="rounded-lg bg-teal-500/10 px-3 py-2 text-sm text-teal-400">
              {message.text}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white",
                "hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-50"
              )}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className={cn(
                "rounded-lg border border-teal-500/30 bg-white/5 px-4 py-2.5 font-medium text-white/90",
                "hover:bg-teal-500/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-50"
              )}
            >
              Sign up
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#0a0a0f] px-2 text-white/50">or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignInWithGoogle}
          disabled={loading}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-white/90",
            "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-50"
          )}
        >
          <GoogleIcon className="h-5 w-5" />
          Sign in with Google
        </button>

        <p className="text-center text-sm text-white/50">
          <Link href="/" className="text-white/70 hover:text-white">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-xl font-semibold">
            Tambo{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Canvas
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-white/60">Loading…</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
