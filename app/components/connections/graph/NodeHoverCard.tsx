import Link from "next/link";
import type { EgoNetworkPerson } from "@/lib/hooks/connection";

interface NodeHoverCardProps {
  person: EgoNetworkPerson;
  /** Top-left position in pixels, relative to the graph's positioned container. */
  x: number;
  y: number;
}

/**
 * Name-only label shown while a node is hovered — the node itself already
 * shows the photo, so this doesn't repeat it. Plain text, no underline or
 * background, so it reads as a caption rather than a UI chrome element.
 * Clicking it opens the profile, same as clicking the node.
 */
export function NodeHoverCard({ person, x, y }: NodeHoverCardProps) {
  return (
    <div
      className="absolute z-20 pointer-events-none transition-[left,top] duration-300 ease-out"
      style={{ left: x, top: y, transform: "translate(-50%, -100%)" }}
    >
      {person.handle ? (
        <Link href={`/profile/${person.handle}`} className="pointer-events-auto font-mono text-xs text-neutral-400">
          {person.name}
        </Link>
      ) : (
        <span className="font-mono text-xs text-neutral-400">{person.name}</span>
      )}
    </div>
  );
}
