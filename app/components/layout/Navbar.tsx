import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full px-8 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-3 h-3 bg-neutral-800 rounded-full" />
        <span className="text-xl font-mono font-semibold text-neutral-800 tracking-tight">
          6 hops
        </span>
      </Link>
      <div className="flex items-center gap-6 text-sm font-mono text-neutral-600">
        <Link href="#" className="hover:text-neutral-900 transition-colors">
          about
        </Link>
        <Link href="#" className="hover:text-neutral-900 transition-colors">
          how it works
        </Link>
      </div>
    </nav>
  );
}
