"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserCard } from "./UserCard";
import { ConnectionsList } from "./ConnectionsList";
import { IndirectConnectionsList } from "./IndirectConnectionsList";
import { RequestsPane } from "./RequestsPane";
import { RequestsTiles, type RightPane } from "./RequestsTiles";
import { useConnections, useConnectionRequests, useReachable } from "@/lib/hooks/connection";
import { useProfile } from "@/lib/hooks/profile";

export function ConnectionsPanel() {
  const { data: session } = useSession();
  const { data: profile } = useProfile();
  const { data: connections } = useConnections();
  const { data: requests } = useConnectionRequests();
  // same query key as IndirectConnectionsList — React Query dedupes the fetch
  const { data: reachable } = useReachable();

  // The only state this coordinator owns: which pane the right column shows.
  // Everything else (modals, confirms) lives in the leaf that owns it.
  const [rightPane, setRightPane] = useState<RightPane>("reachable");

  const incomingCount = requests?.filter((r) => r.direction === "incoming").length ?? 0;
  const outgoingCount = requests?.filter((r) => r.direction === "outgoing").length ?? 0;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:h-[60vh]">
      {/* Left — who you are, and the minimised request tiles */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
        <UserCard
          name={session?.user?.name ?? "You"}
          title={profile?.title ?? ""}
          avatarUrl={session?.user?.image ?? "/user-avatar.png"}
          connectionCount={connections?.length ?? 0}
          reachableCount={reachable?.length ?? 0}
        />
        <RequestsTiles
          incomingCount={incomingCount}
          outgoingCount={outgoingCount}
          active={rightPane}
          onSelect={setRightPane}
        />
      </div>

      {/* Middle — your actual connections */}
      <div className="w-full md:w-80 shrink-0 h-80 md:h-full">
        <ConnectionsList />
      </div>

      {/* Right — reachable, or whichever request pane the tiles selected */}
      <div className="w-full md:w-80 shrink-0 h-80 md:h-full">
        {rightPane === "reachable" ? (
          <IndirectConnectionsList />
        ) : (
          <RequestsPane direction={rightPane} />
        )}
      </div>
    </div>
  );
}
