import Link from "next/link";

interface ConnectionItemProps {
  name: string;
  title: string | null;
  icon?: string | null;
  /** Shortest hop distance from you — always >= 2 for indirect connections */
  hops: number;
  /** Your 1st-degree connection that starts the shortest path */
  viaName: string;
  /** Target user id — links through to the full path view */
  href: string;
}

export function ConnectionItem({ name, title, icon, hops, viaName, href }: ConnectionItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-2 py-3 px-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-mono text-sm text-neutral-600 shrink-0 overflow-hidden">
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt={name} className="w-full h-full object-cover" />
          ) : (
            name?.charAt(0).toUpperCase() ?? "?"
          )}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-sm text-neutral-800 truncate">{name}</p>
          {title && (
            <p className="font-mono text-xs text-neutral-400 truncate">{title}</p>
          )}
          <p className="font-mono text-xs text-neutral-400 truncate">via {viaName}</p>
        </div>
      </div>
      <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 shrink-0">
        {hops} hops
      </span>
    </Link>
  );
}
