"use client";

import { useState } from "react";
import { useSendRequest } from "@/lib/hooks/connection";

interface ConnectRequestModalProps {
  targetId: string;
  targetName: string;
  onClose: () => void;
}

/**
 * The "why is this a strong connection" prompt. A request cannot be sent without
 * a note — the BE rejects an empty one, and mutual notes are what make a
 * connection strong, so there is no skip path here by design.
 */
export function ConnectRequestModal({ targetId, targetName, onClose }: ConnectRequestModalProps) {
  const [note, setNote] = useState("");
  const sendRequest = useSendRequest();

  const handleSend = async () => {
    if (!note.trim()) return;
    try {
      await sendRequest.mutateAsync({ addresseeId: targetId, note });
      onClose();
    } catch {
      // surfaced below via sendRequest.error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-neutral-200 p-6 w-full max-w-md mx-4 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 font-mono text-neutral-400 hover:text-neutral-800 text-lg cursor-pointer"
        >
          x
        </button>

        <h3 className="font-mono font-semibold text-neutral-800 mb-1">
          Connect with {targetName}
        </h3>
        <p className="font-mono text-xs text-neutral-500 mb-4">
          Why is this person a strong connection for you?
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. We collaborated on a project at Acme Corp..."
          rows={4}
          autoFocus
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200
                   font-mono text-sm text-neutral-800 placeholder-neutral-400
                   focus:outline-none focus:border-neutral-400 focus:bg-white
                   transition-colors resize-none"
        />

        {sendRequest.isError && (
          <p className="font-mono text-xs text-red-500 mt-2">
            {sendRequest.error?.message ?? "Failed to send request"}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500
                     hover:bg-neutral-100 transition-colors rounded cursor-pointer"
          >
            cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!note.trim() || sendRequest.isPending}
            className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white
                     hover:bg-neutral-700 transition-colors rounded cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendRequest.isPending ? "sending..." : "send request"}
          </button>
        </div>
      </div>
    </div>
  );
}
