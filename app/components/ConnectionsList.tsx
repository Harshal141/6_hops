"use client";

import { useEffect, useState } from "react";
import { ConnectionItem } from "./ConnectionItem";

interface Connection {
  id: number;
  name: string;
  title: string;
  isStarred: boolean;
  isOnline: boolean;
}

interface ConnectionsResponse {
  connections: Connection[];
  meta: {
    total: number;
    starred: number;
    online: number;
  };
}

export function ConnectionsList() {
  const [data, setData] = useState<ConnectionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConnections() {
      try {
        const res = await fetch("/api/connections");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center h-full">
        <span className="font-mono text-sm text-neutral-400">loading...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center h-full">
        <span className="font-mono text-sm text-neutral-400">
          failed to load connections
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-neutral-200">
        <h3 className="font-mono font-semibold text-neutral-800">
          connections
        </h3>
        <div className="flex gap-4 mt-2 text-xs font-mono text-neutral-400">
          <span>{data.meta.total} total</span>
          <span>★ {data.meta.starred} starred</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {data.meta.online} online
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {data.connections.map((connection) => (
          <ConnectionItem
            key={connection.id}
            name={connection.name}
            title={connection.title}
            isStarred={connection.isStarred}
            isOnline={connection.isOnline}
          />
        ))}
      </div>
    </div>
  );
}
