"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchUsers, useHopsTo, profileDestination, needsPathView, type SearchUser } from "@/lib/hooks/connection";
import { ConnectRequestModal } from "../connections/ConnectRequestModal";
import { Avatar, Input } from "../ui";
import { ConnectionStatusAction } from "../connections/ConnectionStatusAction";

export function DiscoverPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: results, isLoading } = useSearchUsers(debouncedQuery);

  return (
    <div className="w-full max-w-4xl">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="font-mono text-lg font-semibold text-neutral-800 mb-1">
          Discover Connections
        </h2>
        <p className="font-mono text-sm text-neutral-500">
          Search for people to connect with
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-neutral-200 p-4 mb-4">
        <Input
          label="Search by name"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Enter name to search..."
          adornment={isLoading ? <span className="animate-spin inline-block">&#9676;</span> : "⌕"}
        />
      </div>

      {/* Results Section */}
      {debouncedQuery.trim() && results && results.length > 0 && (
        <div className="bg-white border border-neutral-200">
          <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
            <span className="font-mono text-sm text-neutral-600">
              Found{" "}
              <span className="font-semibold text-neutral-800">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "person" : "people"}
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {results.map((user) => (
              <SearchResultItem key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {debouncedQuery.trim() && !isLoading && results && results.length === 0 && (
        <div className="bg-neutral-50 border border-neutral-200 border-dashed py-8 text-center">
          <p className="font-mono text-sm text-neutral-500">
            No people found matching &quot;{debouncedQuery}&quot;
          </p>
        </div>
      )}

      {/* Empty State */}
      {!debouncedQuery.trim() && (
        <div className="bg-neutral-50 border border-neutral-200 border-dashed py-12 text-center">
          <div className="text-4xl mb-3 opacity-30">&#9678;</div>
          <p className="font-mono text-sm text-neutral-500">
            Type a name to search for people
          </p>
          <p className="font-mono text-xs text-neutral-400 mt-1">
            Find people and send them connection requests
          </p>
        </div>
      )}
    </div>
  );
}

function SearchResultItem({ user }: { user: SearchUser }) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  // is_connected already tells us "1 hop away" without waiting on the reachable
  // fetch; anyone else falls back to the graph-derived hop count.
  const reachableHops = useHopsTo(user.id);
  const hops = user.is_connected ? 1 : reachableHops;
  const showPath = needsPathView(hops);

  return (
    <>
      <div className="flex items-center justify-between gap-3 py-3 px-4 hover:bg-neutral-50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <Avatar src={user.icon} name={user.name} />

          {/* Info */}
          <div className="min-w-0">
            <p className="font-mono text-sm text-neutral-800 truncate">{user.name}</p>
            {user.title && (
              <p className="font-mono text-xs text-neutral-500 truncate">{user.title}</p>
            )}
            {showPath && (
              <p className="font-mono text-[10px] text-blue-600 truncate">
                {hops} hops away · reachable via your network
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ConnectionStatusAction
            status={
              user.is_connected ? "connected" : user.pending_direction ?? "none"
            }
            targetName={user.name}
            onConnect={() => setShowConnectModal(true)}
          />

          <Link
            href={profileDestination(user.user_id, hops)}
            className="px-3 py-1.5 border border-neutral-300 font-mono text-xs text-neutral-600
                     hover:border-neutral-800 hover:text-neutral-800 transition-colors"
          >
            {showPath ? "View path" : "View Profile"}
          </Link>
        </div>
      </div>

      {showConnectModal && (
        <ConnectRequestModal
          targetId={user.id}
          targetName={user.name}
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </>
  );
}
