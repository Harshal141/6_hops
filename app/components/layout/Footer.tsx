import Link from "next/link";
import { SocialLinks } from "./SocialLinks";

/**
 * One row from `sm` up (© left; stats, Privacy and the social icons right). Below it, two
 * rows: © with the icons, then the stats and Privacy, wrapping rather than scrolling.
 */
export function Footer() {
  // Derived rather than hardcoded — it was still reading 2025 into the next year.
  const year = new Date().getFullYear();

  return (
    <footer className="w-full px-4 pt-1 pb-3 sm:px-8 sm:py-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-0 border-t border-neutral-300/50 text-xs font-mono text-neutral-400">
      <span className="order-1 shrink-0">© {year} 6 hops</span>
      <div className="order-3 sm:order-2 basis-full sm:basis-auto sm:ml-auto flex items-center flex-wrap gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1 shrink-0">
          <span className="inline-block w-2 h-2 border border-neutral-400" />
          node_count: ∞
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="shrink-0">max_hops: 6</span>
        <span className="hidden sm:inline">|</span>
        <Link href="/privacy" className="shrink-0 hover:text-neutral-700 transition-colors">
          Privacy
        </Link>
        <span className="hidden sm:inline">|</span>
      </div>
      <span className="order-2 sm:order-3">
        <SocialLinks />
      </span>
    </footer>
  );
}
