"use client";

import { EmptyState } from "../ui";
import { RequestRow } from "./RequestRow";
import { useConnectionRequests, type ConnectionRequest } from "@/lib/hooks/connection";
import { ApiError } from "@/lib/utils/api";

type Direction = "incoming" | "outgoing";

const COPY: Record<Direction, { heading: string; blurb: string; empty: string; hint: string }> = {
  incoming: {
    heading: "incoming requests",
    blurb: "people who want to connect with you",
    empty: "no incoming requests",
    hint: "when someone asks to connect, they appear here",
  },
  outgoing: {
    heading: "sent requests",
    blurb: "waiting on a reply",
    empty: "no sent requests",
    hint: "find someone in discover to send your first",
  },
};

export function RequestsPane({ direction }: { direction: Direction }) {
  const { data, isLoading, isError, error } = useConnectionRequests();
  const copy = COPY[direction];
  const requests = (data ?? []).filter((r: ConnectionRequest) => r.direction === direction);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-neutral-200">
        <h3 className="font-mono font-semibold text-neutral-800 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              direction === "incoming" ? "bg-yellow-500" : "bg-blue-500"
            }`}
          />
          {copy.heading}
        </h3>
        <p className="text-xs font-mono text-neutral-400 mt-1">{copy.blurb}</p>
        {!isLoading && !isError && (
          <p className="text-xs font-mono text-neutral-400 mt-2">{requests.length} total</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <EmptyState message="loading..." />}

        {isError && <PaneError error={error} />}

        {!isLoading && !isError && requests.length === 0 && (
          <EmptyState message={copy.empty} hint={copy.hint} />
        )}

        {!isLoading &&
          !isError &&
          requests.map((request) => <RequestRow key={request.id} request={request} />)}
      </div>
    </div>
  );
}

/**
 * 401 and 503 are different problems and need different copy — an expired session
 * previously rendered as "backend unavailable", which sends you debugging the
 * wrong thing.
 */
function PaneError({ error }: { error: unknown }) {
  if (error instanceof ApiError && error.isUnauthenticated) {
    return <EmptyState message="your session expired" hint="reload the page to sign in again" />;
  }
  if (error instanceof ApiError && error.isBackendUnavailable) {
    return <EmptyState message="backend unavailable" hint="the API is not responding" />;
  }
  return <EmptyState message="could not load requests" />;
}
