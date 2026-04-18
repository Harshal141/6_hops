"use client";

import Link from "next/link";
import { useConnections, type Connection } from "@/lib/hooks/connection";

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
          failed to load connections
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
  return (
    <Link
      href={`/profile/${connection.user_a_id === connection.other_user_id ? connection.user_a_id : connection.user_b_id}`}
      className="flex items-center gap-3 py-3 px-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
    >
      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-mono text-sm text-neutral-600 shrink-0">
        {connection.other_icon ? (
          <img
            src={connection.other_icon}
            alt={connection.other_name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          connection.other_name?.charAt(0).toUpperCase() ?? "?"
        )}
      </div>
      <div>
        <p className="font-mono text-sm text-neutral-800">{connection.other_name}</p>
        <p className="font-mono text-xs text-neutral-400">{connection.other_user_id}</p>
      </div>
    </Link>
  );
}
