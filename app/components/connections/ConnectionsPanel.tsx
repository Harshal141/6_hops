"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserCard } from "./UserCard";
import { ConnectionsList } from "./ConnectionsList";
import { IndirectConnectionsList } from "./IndirectConnectionsList";
import {
  usePendingRequests,
  useAcceptRequest,
  useDeclineRequest,
  useConnections,
  type ConnectionRequest,
} from "@/lib/hooks/connection";

export function ConnectionsPanel() {
  const { data: session } = useSession();
  const { data: connections } = useConnections();
  const { data: pending } = usePendingRequests();

  return (
    <div className="flex gap-4 h-[60vh]">
      {/* Left Panel - User Card */}
      <div className="w-64 shrink-0">
        <UserCard
          name={session?.user?.name ?? "You"}
          title=""
          avatarUrl={session?.user?.image ?? "/user-avatar.png"}
          connectionCount={connections?.length ?? 0}
          reachableCount={12}
        />
      </div>

      {/* Middle Panel - Pending + Direct Connections */}
      <div className="w-80 shrink-0 h-full flex flex-col gap-2">
        {pending && pending.length > 0 && (
          <PendingRequestsSection requests={pending} />
        )}
        <div className="flex-1 min-h-0">
          <ConnectionsList />
        </div>
      </div>

      {/* Right Panel - Indirect/Reachable Connections */}
      <div className="w-80 shrink-0 h-full">
        <IndirectConnectionsList />
      </div>
    </div>
  );
}

function PendingRequestsSection({ requests }: { requests: ConnectionRequest[] }) {
  return (
    <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 shrink-0">
      <div className="px-4 py-3 border-b border-yellow-200">
        <h3 className="font-mono font-semibold text-yellow-800 text-sm flex items-center gap-2">
          incoming requests
          <span className="bg-yellow-200 text-yellow-800 text-xs px-1.5 py-0.5 font-mono">
            {requests.length}
          </span>
        </h3>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {requests.map((req) => (
          <PendingRequestItem key={req.id} request={req} />
        ))}
      </div>
    </div>
  );
}

function PendingRequestItem({ request }: { request: ConnectionRequest }) {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptNote, setAcceptNote] = useState("");
  const acceptMutation = useAcceptRequest();
  const declineMutation = useDeclineRequest();

  const handleAccept = async () => {
    if (!acceptNote.trim()) return;
    await acceptMutation.mutateAsync({ id: request.id, note: acceptNote });
    setShowAcceptModal(false);
    setAcceptNote("");
  };

  return (
    <>
      <div className="py-2 px-4 border-b border-yellow-100 last:border-b-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center font-mono text-xs text-neutral-600 shrink-0">
            {request.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-neutral-800 truncate">{request.name}</p>
            <p className="font-mono text-xs text-neutral-400 truncate italic">&quot;{request.requester_note}&quot;</p>
          </div>
        </div>
        <div className="flex gap-1 mt-2 ml-10">
          <button
            onClick={() => setShowAcceptModal(true)}
            className="font-mono text-xs px-2 py-1 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors rounded cursor-pointer"
          >
            accept
          </button>
          <button
            onClick={() => declineMutation.mutate(request.id)}
            disabled={declineMutation.isPending}
            className="font-mono text-xs px-2 py-1 border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors rounded cursor-pointer disabled:opacity-50"
          >
            decline
          </button>
        </div>
      </div>

      {/* Accept modal — provide your note */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAcceptModal(false)}
          />
          <div className="relative bg-white border border-neutral-200 p-6 w-full max-w-md mx-4 shadow-lg">
            <button
              onClick={() => setShowAcceptModal(false)}
              className="absolute top-3 right-3 font-mono text-neutral-400 hover:text-neutral-800 text-lg cursor-pointer"
            >
              x
            </button>

            <h3 className="font-mono font-semibold text-neutral-800 mb-1">
              Accept {request.name}&apos;s request
            </h3>
            <p className="font-mono text-xs text-neutral-500 mb-4">
              Why is {request.name} a strong connection for you?
            </p>

            <textarea
              value={acceptNote}
              onChange={(e) => setAcceptNote(e.target.value)}
              placeholder="e.g. We worked on the same team at..."
              rows={4}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200
                       font-mono text-sm text-neutral-800 placeholder-neutral-400
                       focus:outline-none focus:border-neutral-400 focus:bg-white
                       transition-colors resize-none"
            />

            {acceptMutation.isError && (
              <p className="font-mono text-xs text-red-500 mt-2">
                {acceptMutation.error?.message ?? "Failed to accept"}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500
                         hover:bg-neutral-100 transition-colors rounded cursor-pointer"
              >
                cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={!acceptNote.trim() || acceptMutation.isPending}
                className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white
                         hover:bg-neutral-700 transition-colors rounded cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {acceptMutation.isPending ? "accepting..." : "accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
