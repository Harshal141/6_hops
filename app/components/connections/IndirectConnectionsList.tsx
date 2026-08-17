"use client";

import { EmptyState } from "../ui";
import { ConnectionItem } from "./ConnectionItem";
import { useReachable, DEFAULT_MAX_HOPS } from "@/lib/hooks/connection";
import { ApiError } from "@/lib/utils/api";

export function IndirectConnectionsList() {
  const { data, isLoading, isError, error } = useReachable();
  const people = data ?? [];

  // how many people sit at each hop distance — "2 @ 2 hops, 1 @ 3 hops"
  const countByHop = people.reduce<Record<number, number>>((acc, person) => {
    acc[person.hops] = (acc[person.hops] ?? 0) + 1;
    return acc;
  }, {});

  const isReady = !isLoading && !isError;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-neutral-200">
        <h3 className="font-mono font-semibold text-neutral-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          reachable
        </h3>
        <p className="text-xs font-mono text-neutral-400 mt-1">
          within {DEFAULT_MAX_HOPS} hops of your network
        </p>
        {isReady && (
          <div className="flex gap-4 mt-2 text-xs font-mono text-neutral-400">
            <span>{people.length} total</span>
            {Object.entries(countByHop).map(([hops, count]) => (
              <span key={hops}>
                {count} @ {hops} hops
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <EmptyState message="loading..." />}

        {isError && <ReachableError error={error} />}

        {isReady && people.length === 0 && (
          <EmptyState
            message="no one reachable yet"
            hint="connect with someone first — their network becomes yours"
          />
        )}

        {isReady &&
          people.map((person) => (
            <ConnectionItem
              key={person.id}
              name={person.name}
              title={person.title}
              icon={person.icon}
              hops={person.hops}
              viaName={person.via_name}
              href={`/connection/${person.id}`}
            />
          ))}
      </div>
    </div>
  );
}

function ReachableError({ error }: { error: unknown }) {
  if (error instanceof ApiError && error.isUnauthenticated) {
    return <EmptyState message="your session expired" hint="reload the page to sign in again" />;
  }
  if (error instanceof ApiError && error.isBackendUnavailable) {
    return <EmptyState message="backend unavailable" hint="the API is not responding" />;
  }
  return <EmptyState message="could not load your network" />;
}
