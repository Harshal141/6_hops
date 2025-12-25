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
  indirectConnections: Connection[];
}

export function IndirectConnectionsList() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConnections() {
      try {
        const res = await fetch("/api/connections");
        const json: ConnectionsResponse = await res.json();
        setConnections(json.indirectConnections);
      } catch (error) {
        console.error("Failed to fetch indirect connections:", error);
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

  const starredCount = connections.filter((c) => c.isStarred).length;
  const onlineCount = connections.filter((c) => c.isOnline).length;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-neutral-200">
        <h3 className="font-mono font-semibold text-neutral-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          reachable
        </h3>
        <p className="text-xs font-mono text-neutral-400 mt-1">
          indirect connections via your network
        </p>
        <div className="flex gap-4 mt-2 text-xs font-mono text-neutral-400">
          <span>{connections.length} total</span>
          <span>★ {starredCount} starred</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {onlineCount} online
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {connections.map((connection) => (
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
