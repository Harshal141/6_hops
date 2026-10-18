"use client";

import { Badge, Button } from "../ui";
import type { ConnectionStatus } from "@/lib/hooks/connection";

interface ConnectionStatusActionProps {
  status: ConnectionStatus;
  /** Only called when the status actually allows connecting. */
  onConnect: () => void;
  targetName?: string;
  /** Visible text of the connect button. The accessible name stays "Connect with <name>". */
  connectLabel?: string;
  /** `secondary` for a quieter button in a list of several. */
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  /** Stretch the connect button to its container (below `sm` only with "mobile"). */
  fullWidth?: boolean | "mobile";
  /** Plain-text status in place of the "Request pending" badge, e.g. "✓ Request sent". */
  sentLabel?: string;
}

/**
 * The relationship determines the only sensible action, so this renders a button
 * only when connecting is possible and a status pill otherwise.
 *
 * One component because the same four-state decision was written out three times —
 * on the profile view, the connection-path page, and each Discover result — and
 * they had already drifted apart in wording.
 */
export function ConnectionStatusAction({
  status,
  onConnect,
  targetName,
  connectLabel = "Connect",
  variant = "primary",
  size = "md",
  fullWidth = false,
  sentLabel,
}: ConnectionStatusActionProps) {
  if (status === "connected") return <Badge tone="success">Connected</Badge>;
  if (status === "outgoing") {
    // In the connect button's own box (same variant size, same full-width rule), so swapping
    // one for the other moves nothing. Not a live region: a list of these would be one per
    // row, so the caller announces the change once.
    return sentLabel ? (
      <Button variant="plain" size={size} fullWidth={fullWidth} asText>
        {sentLabel}
      </Button>
    ) : (
      <Badge tone="warning">Request pending</Badge>
    );
  }
  if (status === "incoming") return <Badge tone="warning">Wants to connect</Badge>;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onConnect}
      fullWidth={fullWidth}
      ariaLabel={targetName ? `Connect with ${targetName}` : undefined}
    >
      {connectLabel}
    </Button>
  );
}
