export function Footer() {
  return (
    <footer className="w-full px-6 py-4 flex items-center justify-between border-t border-neutral-300/50 md:px-8 md:py-6">
      <span className="text-xs font-mono text-neutral-400">© 2026 6 hops</span>
      <div className="flex items-center gap-1 text-xs font-mono text-neutral-400">
        <span className="inline-block w-2 h-2 border border-neutral-400 mr-1" />
        <span>node_count: ∞</span>
        <span className="mx-2">|</span>
        <span>max_hops: 6</span>
      </div>
    </footer>
  );
}
