"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full px-8 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-3 h-3 bg-neutral-800 rounded-full" />
        <span className="text-xl font-mono font-semibold text-neutral-800 tracking-tight">
          6 hops
        </span>
      </Link>
      <div className="flex items-center gap-6 text-sm font-mono text-neutral-600">
        {session ? (
          <>
            <Link href="/dashboard" className="hover:text-neutral-900 transition-colors">
              dashboard
            </Link>
            <Link href="/profile" className="hover:text-neutral-900 transition-colors">
              profile
            </Link>
            <LinkAction onClick={() => signOut({ callbackUrl: "/" })}>sign out</LinkAction>
          </>
        ) : (
          <Link href="/login" className="hover:text-neutral-900 transition-colors">
            sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

/**
 * A nav action that reads as a link but performs an action. Kept local because the
 * nav's inline-text treatment is unique to it — the ui/Button variants are all
 * padded controls.
 */
function LinkAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:text-neutral-900 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}
