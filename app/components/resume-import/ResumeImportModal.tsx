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
}

/** The resume-import flow. Mount it to open it; unmounting discards everything, so each open starts on `pick`. */
export function ResumeImportModal({ onClose, onManual }: Props) {
  const parse = useParseResume();
  const apply = useApplyImport();
  const [state, dispatch] = useReducer(resumeImportReducer, INITIAL_IMPORT_STATE);
  const inFlight = useRef<AbortController | null>(null);

  // Closing mid-upload abandons the request; the BE run still finishes and is cached.
  useEffect(() => () => inFlight.current?.abort(), []);

  const upload = async (file: File) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    dispatch({ type: "upload", file });

    try {
      const response = await parse.mutateAsync({ file, signal: controller.signal });
      if (!controller.signal.aborted) dispatch({ type: "parsed", response });
    } catch (err) {
      if (!controller.signal.aborted) dispatch({ type: "parseFailed", error: importErrorFrom(err, "parse") });
    }
  };

  const { review } = state;
  const issues = useMemo(() => (review ? reviewIssues(review) : []), [review]);
  const payload = useMemo(() => (review ? toApplyPayload(review) : null), [review]);
  const nothingSelected = !payload || isPayloadEmpty(payload);

  const accept = async () => {
    if (!review || !payload || issues.length > 0 || nothingSelected) return;
    dispatch({ type: "save" });
    try {
      await apply.mutateAsync({ enrichmentId: review.enrichmentId, payload });
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
