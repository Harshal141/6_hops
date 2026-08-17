"use client";

import { useState } from "react";
import { Button, Modal, Textarea } from "../ui";
import { useSendRequest } from "@/lib/hooks/connection";
import { describeError } from "@/lib/utils/api";

interface ConnectRequestModalProps {
  targetId: string;
  targetName: string;
  onClose: () => void;
}

/**
 * The "why is this a strong connection" prompt. A request cannot be sent without
 * a note — the backend rejects an empty or whitespace-only one.
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
    <Modal
      isOpen
      onClose={onClose}
      title={`Connect with ${targetName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!note.trim()}
            loading={sendRequest.isPending}
          >
            send request
          </Button>
        </>
      }
    >
      <p className="font-mono text-xs text-neutral-500 mb-4">
        Why is this person a strong connection for you?
      </p>

      <Textarea
        value={note}
        onChange={setNote}
        placeholder="e.g. We collaborated on a project at Acme Corp..."
        rows={4}
        maxLength={500}
        ariaLabel="Why they are a strong connection"
      />

      {sendRequest.isError && (
        <p className="font-mono text-xs text-red-500 mt-2">{describeError(sendRequest.error)}</p>
      )}
    </Modal>
  );
}
