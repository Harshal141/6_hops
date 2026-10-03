"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui";
import type { ImportState } from "@/lib/utils/resumeImportMachine";

interface Props {
  state: ImportState;
  /** A ticked item has a blank or malformed field. */
  blocked: boolean;
  /** Nothing is ticked, so accepting would write nothing. */
  nothingSelected: boolean;
  onClose: () => void;
  onAccept: () => void;
  onPickAnother: () => void;
  onRetry: () => void;
}

/** The modal's buttons for each step. Pick and processing have none; the × and the dropzone are the way on. */
export function ImportFooter({ state, blocked, nothingSelected, onClose, onAccept, onPickAnother, onRetry }: Props) {
  const alertRef = useRef<HTMLParagraphElement>(null);
  const [triedAccept, setTriedAccept] = useState(false);

  // A failed save disabled the button that had focus. Move focus to the reason, not back to the top.
  useEffect(() => {
    if (state.applyError) alertRef.current?.focus();
  }, [state.applyError]);

  if (state.step === "review" || state.step === "saving") {
    const saving = state.step === "saving";
    const notice = state.applyError ?? (blocked && triedAccept ? "Fill in the highlighted fields first" : null);
    return (
      <>
        {notice && (
          <p
            ref={alertRef}
            role="alert"
            tabIndex={-1}
            className="basis-full sm:basis-auto sm:mr-auto font-mono text-xs text-danger outline-none"
          >
            {notice}
          </p>
        )}
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => (blocked ? setTriedAccept(true) : onAccept())}
          loading={saving}
          disabled={nothingSelected}
        >
          Add to profile
        </Button>
      </>
    );
  }

  if (state.step === "error" && state.error) {
    const { action } = state.error;
    if (action === "close") {
      return (
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      );
    }
    const canRetry = action === "retry" && state.lastFile !== null;
    return (
      <>
        <Button variant={canRetry ? "secondary" : "primary"} onClick={onPickAnother}>
          Choose another file
        </Button>
        {canRetry && (
          <Button variant="primary" onClick={onRetry}>
            Try again
          </Button>
        )}
      </>
    );
  }

  return null;
}
