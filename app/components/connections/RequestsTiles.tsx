"use client";

import { StatTile } from "../ui";

export type RightPane = "reachable" | "incoming" | "outgoing";

interface RequestsTilesProps {
  incomingCount: number;
  outgoingCount: number;
  active: RightPane;
  onSelect: (pane: RightPane) => void;
}

/**
 * The minimised request tiles that sit under the profile card. Selecting one swaps
 * what the right column shows, and selecting it again returns to reachable.
 *
 * Deliberately not a drawer: this panel already lives inside CollapsibleBox, whose
 * expanded window is CSS-transformed. That makes it the containing block for any
 * `position: fixed` child, so an overlay would centre on the panel rather than the
 * viewport and be clipped by its overflow — and it would then be fighting the
 * dashboard's own backdrop and escape handling.
 */
export function RequestsTiles({
  incomingCount,
  outgoingCount,
  active,
  onSelect,
}: RequestsTilesProps) {
  return (
    <div className="flex flex-col gap-2">
      <StatTile
        label="requests"
        count={incomingCount}
        dot="bg-yellow-500"
        isActive={active === "incoming"}
        ariaLabel={`${incomingCount} incoming requests`}
        onClick={() => onSelect(active === "incoming" ? "reachable" : "incoming")}
      />
      <StatTile
        label="sent"
        count={outgoingCount}
        dot="bg-blue-500"
        isActive={active === "outgoing"}
        ariaLabel={`${outgoingCount} sent requests`}
        onClick={() => onSelect(active === "outgoing" ? "reachable" : "outgoing")}
      />
    </div>
  );
}
