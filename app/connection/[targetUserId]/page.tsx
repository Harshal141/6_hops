"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GridBackground, Navbar, Footer } from "../../components";
import { ConnectRequestModal } from "../../components/connections/ConnectRequestModal";
import { Avatar, Badge } from "../../components/ui";
import { ConnectionStatusAction } from "../../components/connections/ConnectionStatusAction";
import { usePathTo, useConnectionStatus } from "@/lib/hooks/connection";
import { ApiError } from "@/lib/utils/api";

export default function ConnectionPathPage() {
  const params = useParams();
  const targetUserId = params.targetUserId as string;

  const { data, isLoading, error } = usePathTo(targetUserId);
  const status = useConnectionStatus(targetUserId);
  const [showConnectModal, setShowConnectModal] = useState(false);

  if (isLoading) return <Shell><span className="font-mono text-neutral-400">loading...</span></Shell>;

  if (error) {
    const noPath = error instanceof ApiError && error.status === 404;
    return (
      <Shell>
        <div className="text-center">
          <span className="font-mono text-neutral-400 block mb-4">
            {noPath
              ? "No path to this person within 6 hops"
              : "backend unavailable"}
          </span>
          <Link
            href="/dashboard"
            className="font-mono text-sm text-neutral-600 hover:text-neutral-800 underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </Shell>
    );
  }

  if (!data) return null;

  const { hops, path } = data;
  const you = path[0];
  const target = path[path.length - 1];
  const intermediaries = path.slice(1, -1);

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-mono text-sm text-neutral-500 hover:text-neutral-800 mb-6 transition-colors"
          >
            <span>←</span> Back to Dashboard
          </Link>

          {/* ── Path visualisation ── */}
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
              <h2 className="font-mono font-semibold text-neutral-800">Connection Path</h2>
              <Badge tone={hops <= 2 ? "success" : hops <= 4 ? "info" : "neutral"}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  {hops} {hops === 1 ? "hop" : "hops"} away
                </span>
              </Badge>
            </div>

            <div className="flex items-center overflow-x-auto py-4 sm:py-6 px-1 sm:px-2">
              {path.map((person, index) => (
                <div key={person.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <Avatar
                      src={person.icon}
                      name={person.name}
                      size="lg"
                      tone={index === 0 ? "self" : index === path.length - 1 ? "target" : "default"}
                    />
                    <div className="mt-2 text-center max-w-[80px] sm:max-w-[100px]">
                      <p className="font-mono text-xs font-semibold text-neutral-800 truncate">
                        {index === 0 ? "You" : person.name?.split(" ")[0]}
                      </p>
                      {index > 0 && person.title && (
                        <p className="font-mono text-[10px] text-neutral-500 truncate">
                          {person.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {index < path.length - 1 && (
                    <div className="flex items-center mx-2 sm:mx-3 -mt-8">
                      <div className="w-8 sm:w-12 h-px bg-neutral-300 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Suggested approach ── */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
              {intermediaries.length === 0 ? (
                <p className="font-mono text-sm text-neutral-600">
                  You are directly connected to{" "}
                  <span className="font-semibold">{target.name}</span> — just reach out.
                </p>
              ) : (
                <>
                  <p className="font-mono text-xs text-neutral-500 mb-3">Suggested approach:</p>
                  <ol className="space-y-2">
                    {intermediaries.map((person, index) => {
                      const next = path[index + 2];
                      return (
                        <li
                          key={person.id}
                          className="flex items-start gap-2 font-mono text-sm text-neutral-600"
                        >
                          <span className="bg-neutral-100 text-neutral-500 w-5 h-5 flex items-center justify-center text-xs shrink-0">
                            {index + 1}
                          </span>
                          <span>
                            Ask <span className="font-semibold">{person.name}</span>
                            {index === 0 && (
                              <span className="text-neutral-400"> (your connection)</span>
                            )}{" "}
                            to introduce you to{" "}
                            <span
                              className={
                                next.id === target.id
                                  ? "font-semibold text-blue-600"
                                  : "font-semibold"
                              }
                            >
                              {next.name}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </div>
          </div>

          {/* ── Target summary ── */}
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <Avatar src={target.icon} name={target.name} size="xl" tone="target" />
              <div className="flex-1 min-w-0">
                <h1 className="font-mono font-bold text-xl sm:text-3xl text-neutral-800 truncate">
                  {target.name}
                </h1>
                {target.title && (
                  <p className="font-mono text-sm sm:text-lg text-neutral-500 mt-1 truncate">
                    {target.title}
                  </p>
                )}
                <p className="font-mono text-xs sm:text-sm text-neutral-400 mt-2">{target.user_id}</p>

                <div className="flex items-center gap-2 flex-wrap mt-4 sm:mt-5">
                  <Link
                    href={`/profile/${target.id}`}
                    className="px-3 py-1.5 border border-neutral-300 font-mono text-xs text-neutral-600
                             hover:border-neutral-800 hover:text-neutral-800 transition-colors"
                  >
                    view full profile
                  </Link>
                  <ConnectionStatusAction
                    status={status}
                    targetName={target.name}
                    onConnect={() => setShowConnectModal(true)}
                  />
                </div>
              </div>
            </div>

            <p className="font-mono text-xs text-neutral-400 mt-4 sm:mt-6 pt-4 border-t border-neutral-200">
              You and {you.name} · reached through {intermediaries.length}{" "}
              {intermediaries.length === 1 ? "person" : "people"}
            </p>
          </div>
        </div>
      </main>
      <Footer />

      {showConnectModal && (
        <ConnectRequestModal
          targetId={target.id}
          targetName={target.name}
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </GridBackground>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">{children}</main>
      <Footer />
    </GridBackground>
  );
}
