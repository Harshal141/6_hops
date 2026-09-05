"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { IconButton } from "../ui";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full px-4 py-4 sm:px-8 sm:py-6 relative">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-neutral-800 rounded-full" />
          <span className="text-xl font-mono font-semibold text-neutral-800 tracking-tight">
            6 hops
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-mono text-neutral-600">
          <NavLinks session={!!session} />
        </div>

        {/* Mobile toggle */}
        {session ? (
          <div className="sm:hidden flex items-center gap-3">
            <IconButton
              ariaLabel={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              tone="muted"
              size="md"
            >
              {menuOpen ? "×" : "≡"}
            </IconButton>
          </div>
        ) : (
          <div className="sm:hidden text-sm font-mono text-neutral-600">
            <NavLinks session={false} />
          </div>
        )}
      </div>

      {/* Mobile dropdown — only reachable when logged in, matching desktop's link set */}
      {session && menuOpen && (
        <div className="sm:hidden absolute right-4 top-full mt-1 z-50 flex flex-col gap-1 bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg py-2 px-4 text-sm font-mono text-neutral-600">
          <NavLinks session onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
}

interface NavLinksProps {
  session: boolean;
  onNavigate?: () => void;
}

function NavLinks({ session, onNavigate }: NavLinksProps) {
  if (!session) {
    return (
      <LinkAction onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}>
        sign in
      </LinkAction>
    );
  }

  return (
    <>
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="hover:text-neutral-900 transition-colors py-1"
      >
        dashboard
      </Link>
      <Link
        href="/profile"
        onClick={onNavigate}
        className="hover:text-neutral-900 transition-colors py-1"
      >
        profile
      </Link>
      <LinkAction
        onClick={() => {
          onNavigate?.();
          signOut({ callbackUrl: "/" });
        }}
      >
        sign out
      </LinkAction>
    </>
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
      className="hover:text-neutral-900 transition-colors cursor-pointer p-0 py-1 text-left w-full sm:w-auto"
    >
      {children}
    </button>
  );
}
