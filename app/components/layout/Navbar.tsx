"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="w-full px-8 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-3 h-3 bg-neutral-800 rounded-full" />
        <span className="text-xl font-mono font-semibold text-neutral-800 tracking-tight">
          6 hops
        </span>
      </Link>
      <div className="flex items-center gap-6 text-sm font-mono text-neutral-600">
        {!loading && user ? (
          <>
            <Link
              href="/dashboard"
              className="hover:text-neutral-900 transition-colors"
            >
              dashboard
            </Link>
            <Link
              href="/profile"
              className="hover:text-neutral-900 transition-colors"
            >
              profile
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-neutral-900 transition-colors"
            >
              logout
            </button>
          </>
        ) : !loading ? (
          <Link
            href="/login"
            className="hover:text-neutral-900 transition-colors"
          >
            log in
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
