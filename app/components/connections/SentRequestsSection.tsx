"use client";

import { useWithdrawRequest, type ConnectionRequest } from "@/lib/hooks/connection";

export function SentRequestsSection({ requests }: { requests: ConnectionRequest[] }) {
  return (
    <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 shrink-0">
      <div className="px-4 py-3 border-b border-blue-200">
        <h3 className="font-mono font-semibold text-blue-800 text-sm flex items-center gap-2">
          sent requests
          <span className="bg-blue-200 text-blue-800 text-xs px-1.5 py-0.5 font-mono">
            {requests.length}
          </span>
        </h3>
      </div>
      <div className="max-h-40 overflow-y-auto">
        {requests.map((request) => (
          <SentRequestItem key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}

function SentRequestItem({ request }: { request: ConnectionRequest }) {
  const withdraw = useWithdrawRequest();

  return (
    <div className="py-2 px-4 border-b border-blue-100 last:border-b-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center font-mono text-xs text-neutral-600 shrink-0">
          {request.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-neutral-800 truncate">{request.name}</p>
          <p className="font-mono text-xs text-neutral-400 truncate italic">
            &quot;{request.requester_note}&quot;
          </p>
        </div>
        <button
          onClick={() => withdraw.mutate(request.id)}
          disabled={withdraw.isPending}
          className="font-mono text-xs px-2 py-1 border border-neutral-300 text-neutral-500
                   hover:bg-neutral-100 transition-colors rounded cursor-pointer
                   disabled:opacity-50 shrink-0"
        >
          {withdraw.isPending ? "..." : "withdraw"}
        </button>
      </div>
      {withdraw.isError && (
        <p className="font-mono text-xs text-red-500 mt-1 ml-10">
          {withdraw.error?.message ?? "Failed to withdraw"}
        </p>
      )}
    </div>
  );
}
