"use client";

import { Badge, Button } from "../ui";
import type { ConnectionStatus } from "@/lib/hooks/connection";

interface ConnectionStatusActionProps {
  status: ConnectionStatus;
  /** Only called when the status actually allows connecting. */
  onConnect: () => void;
  targetName?: string;
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
}: ConnectionStatusActionProps) {
  if (status === "connected") return <Badge tone="success">connected</Badge>;
  if (status === "outgoing") return <Badge tone="warning">request pending</Badge>;
  if (status === "incoming") return <Badge tone="warning">wants to connect</Badge>;

  return (
    <Button
      variant="primary"
      size="md"
      onClick={onConnect}
      ariaLabel={targetName ? `Connect with ${targetName}` : undefined}
    >
      connect
    </Button>
  );
}
