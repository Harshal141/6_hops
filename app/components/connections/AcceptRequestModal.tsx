"use client";

import { useState } from "react";
import { Button, Modal, Textarea } from "../ui";
import { useAcceptRequest } from "@/lib/hooks/connection";
import { describeError } from "@/lib/utils/api";

interface AcceptRequestModalProps {
  requestId: string;
  requesterName: string;
  onClose: () => void;
}

/**
 * Accepting needs your own note — mutual notes are what make a connection strong,
 * so the backend rejects an empty one and there is no skip path here by design.
 */
export function AcceptRequestModal({ requestId, requesterName, onClose }: AcceptRequestModalProps) {
  const [note, setNote] = useState("");
  const accept = useAcceptRequest();

  const handleAccept = async () => {
    if (!note.trim()) return;
    try {
      await accept.mutateAsync({ id: requestId, note });
      onClose();
    } catch {
      // surfaced below — mutateAsync rejects, so this must be caught
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Accept ${requesterName}'s request`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAccept}
            disabled={!note.trim()}
            loading={accept.isPending}
          >
            accept
          </Button>
        </>
      }
    >
      <p className="font-mono text-xs text-neutral-500 mb-4">
        Why is {requesterName} a strong connection for you?
      </p>

      <Textarea
        value={note}
        onChange={setNote}
        placeholder="e.g. We worked on the same team at..."
        rows={4}
        maxLength={500}
        ariaLabel="Why they are a strong connection"
      />

      {accept.isError && (
        <p className="font-mono text-xs text-red-500 mt-2">{describeError(accept.error)}</p>
      )}
    </Modal>
  );
}
