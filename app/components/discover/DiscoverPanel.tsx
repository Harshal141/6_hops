"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchUsers, type SearchUser } from "@/lib/hooks/connection";

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
        <div>
          <label className="block font-mono text-xs text-neutral-500 mb-2">
            Search by name
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter name to search..."
              className="w-full px-4 py-2 pr-10 bg-neutral-50 border border-neutral-200
                       font-mono text-sm text-neutral-800 placeholder-neutral-400
                       focus:outline-none focus:border-neutral-400 focus:bg-white
                       transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {isLoading ? (
                <span className="animate-spin inline-block">&#9676;</span>
              ) : (
                "⌕"
              )}
            </span>
          </div>
        </div>
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
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-neutral-50 transition-colors">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-mono text-sm text-neutral-600 shrink-0">
          {user.name?.charAt(0).toUpperCase() ?? "?"}
        </div>

        {/* Info */}
        <div>
          <p className="font-mono text-sm text-neutral-800">{user.name}</p>
          {user.title && (
            <p className="font-mono text-xs text-neutral-500">{user.title}</p>
          )}
        </div>
      </div>

      {/* View Profile */}
      <Link
        href={`/profile/${user.id}`}
        className="px-3 py-1.5 border border-neutral-300 font-mono text-xs text-neutral-600
                 hover:border-neutral-800 hover:text-neutral-800 transition-colors"
      >
        View Profile
      </Link>
    </div>
  );
}
