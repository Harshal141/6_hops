"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GridBackground, Navbar, Footer } from "../components";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-mono font-bold text-2xl text-neutral-800 mb-8 text-center">
            [ log in ]
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-500 mb-1.5">
                email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 font-mono text-sm text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-500 mb-1.5">
                password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 font-mono text-sm text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm font-mono text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3 bg-neutral-800 text-white font-mono text-sm tracking-wide hover:bg-neutral-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "logging in..." : "[ log in ]"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-mono text-neutral-500">
            don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-neutral-800 hover:underline"
            >
              sign up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
