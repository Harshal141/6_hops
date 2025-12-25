"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  industries,
  jobRoles,
} from "../../data/industries";

interface DiscoveredConnection {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  hopDistance: number;
  mutualConnections: number;
}

// Mock discovered connections for demo
const mockDiscoveredConnections: DiscoveredConnection[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "VP of Engineering",
    company: "TechCorp",
    industry: "Technology",
    hopDistance: 2,
    mutualConnections: 3,
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    title: "Director of Product",
    company: "FinanceHub",
    industry: "Finance & Banking",
    hopDistance: 3,
    mutualConnections: 1,
  },
  {
    id: "3",
    name: "Emily Watson",
    title: "CTO",
    company: "HealthFirst",
    industry: "Healthcare & Life Sciences",
    hopDistance: 2,
    mutualConnections: 5,
  },
  {
    id: "4",
    name: "David Kim",
    title: "Senior Manager",
    company: "RetailPro",
    industry: "Retail & Consumer",
    hopDistance: 4,
    mutualConnections: 2,
  },
  {
    id: "5",
    name: "Lisa Thompson",
    title: "Board Member",
    company: "EnergyFlow",
    industry: "Energy & Utilities",
    hopDistance: 3,
    mutualConnections: 1,
  },
  {
    id: "6",
    name: "James Park",
    title: "C Level Exec",
    company: "MediaWave",
    industry: "Media & Entertainment",
    hopDistance: 5,
    mutualConnections: 2,
  },
];

export function DiscoverPanel() {
  // Core search state
  const [searchQuery, setSearchQuery] = useState("");
  const [hopRange, setHopRange] = useState(3);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Industry filter state (3-tier)
  const [selectedMainIndustry, setSelectedMainIndustry] = useState<string>("");
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>("");
  const [selectedMicroIndustry, setSelectedMicroIndustry] = useState<string>("");

  // Role filter state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Search results state
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Get available sub-industries based on selected main industry
  const availableSubIndustries = useMemo(() => {
    if (!selectedMainIndustry) return [];
    const mainInd = industries.find((ind) => ind.id === selectedMainIndustry);
    return mainInd?.sub || [];
  }, [selectedMainIndustry]);

  // Get available micro-industries based on selected sub-industry
  const availableMicroIndustries = useMemo(() => {
    if (!selectedSubIndustry || !selectedMainIndustry) return [];
    const mainInd = industries.find((ind) => ind.id === selectedMainIndustry);
    const subInd = mainInd?.sub.find((sub) => sub.id === selectedSubIndustry);
    return subInd?.micro || [];
  }, [selectedMainIndustry, selectedSubIndustry]);

  // Handle main industry change
  const handleMainIndustryChange = (value: string) => {
    setSelectedMainIndustry(value);
    setSelectedSubIndustry("");
    setSelectedMicroIndustry("");
  };

  // Handle sub industry change
  const handleSubIndustryChange = (value: string) => {
    setSelectedSubIndustry(value);
    setSelectedMicroIndustry("");
  };

  // Toggle role selection
  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  // Handle search
  const handleSearch = () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setHopRange(3);
    setSelectedMainIndustry("");
    setSelectedSubIndustry("");
    setSelectedMicroIndustry("");
    setSelectedRoles([]);
    setHasSearched(false);
  };

  // Filter mock results based on hop range
  const filteredResults = mockDiscoveredConnections.filter(
    (conn) => conn.hopDistance <= hopRange
  );

  return (
    <div className="w-full max-w-4xl">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="font-mono text-lg font-semibold text-neutral-800 mb-1">
          Discover Connections
        </h2>
        <p className="font-mono text-sm text-neutral-500">
          Find people within your extended network up to 6 hops away
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-neutral-200 p-4 mb-4">
        {/* Username Search */}
        <div className="mb-4">
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
              ⌕
            </span>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 font-mono text-sm text-neutral-600
                   hover:text-neutral-800 transition-colors mb-4"
        >
          <span
            className={`transition-transform ${
              showAdvancedFilters ? "rotate-90" : ""
            }`}
          >
            ▸
          </span>
          Advanced Filters
          {(selectedMainIndustry || selectedRoles.length > 0 || hopRange !== 3) && (
            <span className="bg-neutral-800 text-white text-xs px-1.5 py-0.5 font-mono">
              active
            </span>
          )}
        </button>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="border-t border-neutral-200 pt-4 space-y-4">
            {/* Hop Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs text-neutral-500">
                  Connection depth (hops)
                </label>
                <span className="font-mono text-sm font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5">
                  {hopRange} {hopRange === 1 ? "hop" : "hops"}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={hopRange}
                  onChange={(e) => setHopRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-none appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4
                           [&::-webkit-slider-thumb]:bg-neutral-800
                           [&::-webkit-slider-thumb]:border-0
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-moz-range-thumb]:w-4
                           [&::-moz-range-thumb]:h-4
                           [&::-moz-range-thumb]:bg-neutral-800
                           [&::-moz-range-thumb]:border-0
                           [&::-moz-range-thumb]:rounded-none
                           [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <span
                      key={num}
                      className={`font-mono text-xs ${
                        num <= hopRange ? "text-neutral-800" : "text-neutral-300"
                      }`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <p className="font-mono text-xs text-neutral-400 mt-2">
                {hopRange === 1 && "Direct connections only"}
                {hopRange === 2 && "Friends of friends"}
                {hopRange === 3 && "Extended network (default)"}
                {hopRange === 4 && "Wide network reach"}
                {hopRange === 5 && "Very wide network"}
                {hopRange === 6 && "Maximum reach - 6 degrees of separation"}
              </p>
            </div>

            {/* Industry Filter - 3 Tier */}
            <div>
              <label className="block font-mono text-xs text-neutral-500 mb-2">
                Industry
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Main Industry */}
                <div>
                  <select
                    value={selectedMainIndustry}
                    onChange={(e) => handleMainIndustryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200
                             font-mono text-sm text-neutral-800
                             focus:outline-none focus:border-neutral-400 focus:bg-white
                             transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">All Industries</option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                  <p className="font-mono text-xs text-neutral-400 mt-1">
                    Main
                  </p>
                </div>

                {/* Sub Industry */}
                <div>
                  <select
                    value={selectedSubIndustry}
                    onChange={(e) => handleSubIndustryChange(e.target.value)}
                    disabled={!selectedMainIndustry}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200
                             font-mono text-sm text-neutral-800
                             focus:outline-none focus:border-neutral-400 focus:bg-white
                             transition-colors appearance-none cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Sub-industries</option>
                    {availableSubIndustries.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <p className="font-mono text-xs text-neutral-400 mt-1">Sub</p>
                </div>

                {/* Micro Industry */}
                <div>
                  <select
                    value={selectedMicroIndustry}
                    onChange={(e) => setSelectedMicroIndustry(e.target.value)}
                    disabled={!selectedSubIndustry}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200
                             font-mono text-sm text-neutral-800
                             focus:outline-none focus:border-neutral-400 focus:bg-white
                             transition-colors appearance-none cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Specializations</option>
                    {availableMicroIndustries.map((micro) => (
                      <option key={micro.id} value={micro.id}>
                        {micro.name}
                      </option>
                    ))}
                  </select>
                  <p className="font-mono text-xs text-neutral-400 mt-1">
                    Specialization
                  </p>
                </div>
              </div>
            </div>

            {/* Job Role Filter */}
            <div>
              <label className="block font-mono text-xs text-neutral-500 mb-2">
                Job Level / Role
              </label>
              <div className="flex flex-wrap gap-2">
                {jobRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`px-3 py-1.5 font-mono text-sm border transition-all
                              ${
                                selectedRoles.includes(role.id)
                                  ? "bg-neutral-800 text-white border-neutral-800"
                                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                              }`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedMainIndustry || selectedRoles.length > 0 || hopRange !== 3) && (
              <button
                onClick={clearFilters}
                className="font-mono text-xs text-neutral-500 hover:text-neutral-800
                         transition-colors underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Search Button */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex-1 py-2.5 bg-neutral-800 text-white font-mono text-sm
                     hover:bg-neutral-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <span className="animate-spin">◌</span>
                Searching...
              </>
            ) : (
              <>
                <span>⌕</span>
                Discover Connections
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="bg-white border border-neutral-200">
          {/* Results Header */}
          <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-neutral-600">
                Found{" "}
                <span className="font-semibold text-neutral-800">
                  {filteredResults.length}
                </span>{" "}
                reachable connections
              </span>
              <span className="font-mono text-xs text-neutral-400">
                within {hopRange} hops
              </span>
            </div>
          </div>

          {/* Results List */}
          <div className="divide-y divide-neutral-100">
            {filteredResults.length === 0 ? (
              <div className="py-12 text-center">
                <span className="font-mono text-neutral-400">
                  No connections found matching your criteria
                </span>
              </div>
            ) : (
              filteredResults.map((connection) => (
                <DiscoveredConnectionItem
                  key={connection.id}
                  connection={connection}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && (
        <div className="bg-neutral-50 border border-neutral-200 border-dashed py-12 text-center">
          <div className="text-4xl mb-3 opacity-30">◎</div>
          <p className="font-mono text-sm text-neutral-500">
            Use the filters above to discover connections
          </p>
          <p className="font-mono text-xs text-neutral-400 mt-1">
            Find people through your network up to 6 degrees away
          </p>
        </div>
      )}
    </div>
  );
}

// Individual connection result item
function DiscoveredConnectionItem({
  connection,
}: {
  connection: DiscoveredConnection;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-neutral-50 transition-colors">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-mono text-sm text-neutral-600">
          {connection.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div>
          <p className="font-mono text-sm text-neutral-800">{connection.name}</p>
          <p className="font-mono text-xs text-neutral-500">
            {connection.title} at {connection.company}
          </p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4">
        {/* Mutual Connections */}
        <div className="text-right">
          <p className="font-mono text-xs text-neutral-400">mutual</p>
          <p className="font-mono text-sm text-neutral-600">
            {connection.mutualConnections}
          </p>
        </div>

        {/* Hop Distance Badge */}
        <div
          className={`px-2 py-1 font-mono text-xs
                    ${
                      connection.hopDistance <= 2
                        ? "bg-green-100 text-green-700"
                        : connection.hopDistance <= 4
                        ? "bg-blue-100 text-blue-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
        >
          {connection.hopDistance} {connection.hopDistance === 1 ? "hop" : "hops"}
        </div>

        {/* Connect Button */}
        <Link
          href={`/connection/${connection.id}`}
          className="px-3 py-1.5 border border-neutral-300 font-mono text-xs text-neutral-600
                   hover:border-neutral-800 hover:text-neutral-800 transition-colors"
        >
          View Path
        </Link>
      </div>
    </div>
  );
}
