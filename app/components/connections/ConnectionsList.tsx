"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, Button, EmptyState } from "../ui";
import { useConnections, useDisconnect, type Connection } from "@/lib/hooks/connection";
import { ApiError, describeError } from "@/lib/utils/api";

export function ConnectionsList() {
  const { data: connections, isLoading, isError, error } = useConnections();
  const list = connections ?? [];

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-neutral-200">
        <h3 className="font-mono font-semibold text-neutral-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          connections
        </h3>
        <p className="text-xs font-mono text-neutral-400 mt-1">people you know directly</p>
        {!isLoading && !isError && (
          <p className="text-xs font-mono text-neutral-400 mt-2">{list.length} total</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <EmptyState message="loading..." />}

        {isError && <ListError error={error} />}

        {!isLoading && !isError && list.length === 0 && (
          <EmptyState
            message="no connections yet"
            hint="search for someone in discover to send your first request"
          />
        )}

        {!isLoading &&
          !isError &&
          list.map((connection) => <ConnectionRow key={connection.id} connection={connection} />)}
      </div>
    </div>
  );
}

function ListError({ error }: { error: unknown }) {
  if (error instanceof ApiError && error.isUnauthenticated) {
    return <EmptyState message="your session expired" hint="reload the page to sign in again" />;
  }
  if (error instanceof ApiError && error.isBackendUnavailable) {
    return <EmptyState message="backend unavailable" hint="the API is not responding" />;
  }
  return <EmptyState message="could not load connections" />;
}

function ConnectionRow({ connection }: { connection: Connection }) {
  // two-step confirm — disconnecting is a soft delete, but still not a misclick
  const [confirming, setConfirming] = useState(false);
  const disconnect = useDisconnect();

  return (
    <div className="group border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors">
      <div className="flex items-center gap-3 py-3 px-4">
        <Link href={`/profile/${connection.other_id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar src={connection.other_icon} name={connection.other_name} />
          <div className="min-w-0">
            <p className="font-mono text-sm text-neutral-800 truncate">{connection.other_name}</p>
            <p className="font-mono text-xs text-neutral-400 truncate">
              {connection.other_title || connection.other_user_id}
            </p>
          </div>
        </Link>

        {confirming ? (
          <div className="flex gap-1 shrink-0">
            <Button
              variant="danger"
              size="sm"
              onClick={() => disconnect.mutate(connection.id)}
              loading={disconnect.isPending}
            >
              confirm
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
              no
            </Button>
          </div>
        ) : (
          <div className="shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(true)}
              ariaLabel={`Disconnect from ${connection.other_name}`}
            >
              disconnect
            </Button>
          </div>
        )}
      </div>

      {disconnect.isError && (
        <p className="font-mono text-xs text-red-500 px-4 pb-2">{describeError(disconnect.error)}</p>
      )}
    </div>
  );
}
