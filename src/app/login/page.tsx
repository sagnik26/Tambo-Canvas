"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
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
    router.push(next);
    router.refresh();
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

        <p className="text-center text-sm text-white/50">
          <Link href="/" className="text-white/70 hover:text-white">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
