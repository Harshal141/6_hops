"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, Button } from "../ui";
import { AcceptRequestModal } from "./AcceptRequestModal";
import {
  useDeclineRequest,
  useWithdrawRequest,
  type ConnectionRequest,
} from "@/lib/hooks/connection";
import { describeError } from "@/lib/utils/api";

/**
 * One pending request, incoming or outgoing.
 *
 * The mutations live here rather than in the parent pane so `isPending` disables
 * only this row's buttons — a pane-level mutation would grey out every row on any
 * click.
 */
export function RequestRow({ request }: { request: ConnectionRequest }) {
  const [showAccept, setShowAccept] = useState(false);
  const decline = useDeclineRequest();
  const withdraw = useWithdrawRequest();

  const isIncoming = request.direction === "incoming";
  const error = decline.error ?? withdraw.error;

  return (
    <>
      <div className="px-4 py-3 border-b border-neutral-100 last:border-b-0">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${request.other_handle}`} className="shrink-0">
            <Avatar src={request.other_icon} name={request.other_name} />
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${request.other_handle}`}
              className="font-mono text-sm text-neutral-800 hover:underline block truncate"
            >
              {request.other_name}
            </Link>
            {request.other_title && (
              <p className="font-mono text-xs text-neutral-400 truncate">{request.other_title}</p>
            )}
            {/* the note is the point of the feature, so it wraps rather than truncates */}
            <p className="font-mono text-xs text-neutral-500 mt-1.5 italic break-words">
              &ldquo;{request.requester_note}&rdquo;
            </p>

            <div className="flex gap-1.5 mt-2">
              {isIncoming ? (
                <>
                  <Button variant="primary" size="sm" onClick={() => setShowAccept(true)}>
                    accept
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => decline.mutate(request.id)}
                    loading={decline.isPending}
                  >
                    decline
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => withdraw.mutate(request.id)}
                  loading={withdraw.isPending}
                >
                  withdraw
                </Button>
              )}
            </div>

            {error && (
              <p className="font-mono text-xs text-red-500 mt-1.5">{describeError(error)}</p>
            )}
          </div>
        </div>
      </div>

      {showAccept && (
        <AcceptRequestModal
          requestId={request.id}
          requesterName={request.other_name}
          onClose={() => setShowAccept(false)}
        />
      )}
    </>
  );
}
