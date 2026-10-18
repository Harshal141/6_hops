"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { Modal } from "../ui";
import { ImportPick } from "./ImportPick";
import { ImportProgress } from "./ImportProgress";
import { ImportReview } from "./ImportReview";
import { ImportFooter } from "./ImportFooter";
import { useApplyImport, useParseResume } from "@/lib/hooks/resumeImport";
import { isPayloadEmpty, reviewIssues, toApplyPayload, type ReviewState } from "@/lib/utils/resumeImportDraft";
import { importErrorFrom } from "@/lib/utils/resumeImportErrors";
import {
  INITIAL_IMPORT_STATE,
  contentStep,
  resumeImportReducer,
  type ImportStep,
} from "@/lib/utils/resumeImportMachine";

const TITLES: Record<ImportStep, string> = {
  pick: "Import your resume",
  processing: "Reading your resume",
  review: "Check your details",
  saving: "Check your details",
  error: "Import your resume",
};

interface Props {
  onClose: () => void;
  /** Offers a "fill it in myself" way out on the pick step, besides the ×. */
  onManual?: () => void;
  /**
   * A file the caller already picked (an inline dropzone): the modal opens straight on
   * "Reading your resume" instead of asking for one again.
   */
  initialFile?: File;
  /** Called once the reviewed draft is saved, just before the modal closes. */
  onApplied?: () => void;
}

/** The resume-import flow. Mount it to open it; unmounting discards everything, so each open starts on `pick`. */
export function ResumeImportModal({ onClose, onManual, initialFile, onApplied }: Props) {
  const parse = useParseResume();
  const apply = useApplyImport();
  // A handed-in file starts the machine already past `pick`, as if it had just been dropped.
  const [state, dispatch] = useReducer(resumeImportReducer, initialFile, (file?: File) =>
    file ? resumeImportReducer(INITIAL_IMPORT_STATE, { type: "upload", file }) : INITIAL_IMPORT_STATE,
  );
  const inFlight = useRef<AbortController | null>(null);

  // Closing mid-upload abandons the request; the BE run still finishes and is cached.
  useEffect(() => () => inFlight.current?.abort(), []);

  /** Sends one file; the machine must already be on `processing`. */
  async function send(file: File) {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    try {
      const response = await parse.mutateAsync({ file, signal: controller.signal });
      if (!controller.signal.aborted) dispatch({ type: "parsed", response });
    } catch (err) {
      if (!controller.signal.aborted) dispatch({ type: "parseFailed", error: importErrorFrom(err, "parse") });
    }
  }

  const upload = (file: File) => {
    dispatch({ type: "upload", file });
    send(file);
  };

  // Mount-only on purpose: a handed-in file is sent once. `send` aborts any earlier
  // request itself, so a dev-mode double mount still ends with one live upload.
  useEffect(() => {
    if (initialFile) send(initialFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { review } = state;
  const issues = useMemo(() => (review ? reviewIssues(review) : []), [review]);
  const payload = useMemo(() => (review ? toApplyPayload(review) : null), [review]);
  const nothingSelected = !payload || isPayloadEmpty(payload);

  const accept = async () => {
    if (!review || !payload || issues.length > 0 || nothingSelected) return;
    dispatch({ type: "save" });
    try {
      await apply.mutateAsync({ enrichmentId: review.enrichmentId, payload });
      onApplied?.();
      onClose();
    } catch (err) {
      dispatch({ type: "saveFailed", error: importErrorFrom(err, "apply") });
    }
  };

  const step = contentStep(state.step);
  const reviewing = step === "review";
  const prompting = Boolean(onManual) && step === "pick";
  const hasFooter = reviewing || step === "error";

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={prompting ? "Your profile is empty" : TITLES[state.step]}
      size={reviewing ? "lg" : "md"}
      dismissible={!reviewing}
      focusKey={step}
      footer={
        hasFooter ? (
          <ImportFooter
            state={state}
            blocked={issues.length > 0}
            nothingSelected={nothingSelected}
            onClose={onClose}
            onAccept={accept}
            onPickAnother={() => dispatch({ type: "pickAnother" })}
            onRetry={() => state.lastFile && upload(state.lastFile)}
          />
        ) : undefined
      }
    >
      {step === "pick" && (
        <ImportPick
          onFile={upload}
          intro={prompting ? "Fill it in from your resume." : undefined}
          onManual={onManual}
        />
      )}
      {step === "processing" && <ImportProgress />}
      {reviewing && review && (
        <ImportReview
          state={review}
          onChange={(next: ReviewState) => dispatch({ type: "edit", review: next })}
          issues={issues}
          disabled={state.step === "saving"}
        />
      )}
      {step === "error" && state.error && (
        <p role="alert" className="font-mono text-sm text-fg-body leading-relaxed py-2">
          {state.error.message}
        </p>
      )}
    </Modal>
  );
}
