export function Footer() {
  // Derived rather than hardcoded — it was still reading 2025 into the next year.
  const year = new Date().getFullYear();

  return (
    <footer className="w-full px-4 py-4 sm:px-8 sm:py-6 flex flex-row items-start gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-300/50">
      <span className="text-xs font-mono text-neutral-400 shrink-0">© {year} 6 hops</span>
      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-mono text-neutral-400">
        <span className="inline-flex items-center gap-1 shrink-0">
          <span className="inline-block w-2 h-2 border border-neutral-400" />
          node_count: ∞
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="shrink-0">max_hops: 6</span>
      </div>
    </footer>
  );
}
