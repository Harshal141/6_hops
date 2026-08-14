"use client";

import { useState } from "react";
import Link from "next/link";
import { useConnections, useDisconnect, type Connection } from "@/lib/hooks/connection";

export function ConnectionsList() {
  const { data: connections, isLoading, isError } = useConnections();

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center h-full">
        <span className="font-mono text-sm text-neutral-400">loading...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center h-full">
        <span className="font-mono text-sm text-neutral-400">
          backend unavailable
        </span>
      </div>
    );
  }

  const list = connections ?? [];

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-neutral-200">
        <h3 className="font-mono font-semibold text-neutral-800">
          connections
        </h3>
        <div className="flex gap-4 mt-2 text-xs font-mono text-neutral-400">
          <span>{list.length} total</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {list.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-mono text-xs text-neutral-400">
              no connections yet
            </span>
          </div>
        ) : (
          list.map((conn) => (
            <ConnectionRow key={conn.id} connection={conn} />
          ))
        )}
      </div>
    </div>
  );
}

function ConnectionRow({ connection }: { connection: Connection }) {
  // two-step confirm — disconnecting is a soft delete, but still not a misclick
  const [confirming, setConfirming] = useState(false);
  const disconnect = useDisconnect();

  return (
    <div className="group border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors">
      <div className="flex items-center gap-3 py-3 px-4">
        <Link
          href={`/profile/${connection.other_id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-mono text-sm text-neutral-600 shrink-0 overflow-hidden">
            {connection.other_icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={connection.other_icon}
                alt={connection.other_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              connection.other_name?.charAt(0).toUpperCase() ?? "?"
            )}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-sm text-neutral-800 truncate">
              {connection.other_name}
            </p>
            <p className="font-mono text-xs text-neutral-400 truncate">
              {connection.other_user_id}
            </p>
          </div>
        </Link>

        {confirming ? (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => disconnect.mutate(connection.id)}
              disabled={disconnect.isPending}
              className="font-mono text-xs px-2 py-1 bg-red-600 text-white hover:bg-red-500
                       transition-colors rounded cursor-pointer disabled:opacity-50"
            >
              {disconnect.isPending ? "..." : "confirm"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="font-mono text-xs px-2 py-1 border border-neutral-300 text-neutral-500
                       hover:bg-neutral-100 transition-colors rounded cursor-pointer"
            >
              no
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="font-mono text-xs px-2 py-1 border border-neutral-200 text-neutral-400
                     hover:border-red-300 hover:text-red-600 transition-colors rounded
                     cursor-pointer shrink-0 opacity-0 group-hover:opacity-100
                     focus-visible:opacity-100"
          >
            disconnect
          </button>
        )}
      </div>

      {disconnect.isError && (
        <p className="font-mono text-xs text-red-500 px-4 pb-2">
          {disconnect.error?.message ?? "Failed to disconnect"}
        </p>
      )}
    </div>
  );
}
