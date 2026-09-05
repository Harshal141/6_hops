"use client";

import { CollapsibleBox } from "../ui";
import { ConnectionsPanel } from "./ConnectionsPanel";
import { useConnectionRequests } from "@/lib/hooks/connection";

/** The dashboard's "connections" tile — owns the incoming-request badge so the box itself flags pending requests. */
export function ConnectionsBox() {
  const { data: requests } = useConnectionRequests();
  const incomingCount = requests?.filter((r) => r.direction === "incoming").length ?? 0;

  return (
    <CollapsibleBox title="connections" icon={<span>◉</span>} defaultOpen={false} badge={incomingCount}>
      <ConnectionsPanel />
    </CollapsibleBox>
  );
}
