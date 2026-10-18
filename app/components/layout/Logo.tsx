import Link from "next/link";

/** The "● 6 hops" wordmark, linking home. One size at every breakpoint, wherever a header shows it. */
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span aria-hidden className="w-3 h-3 bg-neutral-800 rounded-full" />
      <span className="text-xl font-mono font-semibold text-neutral-800 tracking-tight">6 hops</span>
    </Link>
  );
}
