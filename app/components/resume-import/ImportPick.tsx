"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, FileDropzone } from "../ui";
import { IMPORT_ERRORS } from "@/lib/utils/resumeImportErrors";

/** Matches the BE's upload limit, so bigger files are refused before any upload. */
const MAX_PDF_BYTES = 2 * 1024 * 1024;

interface Props {
  onFile: (file: File) => void;
  /** Optional one-line lead above the dropzone. */
  intro?: string;
  /** Adds a "Fill it in myself" button beside the privacy note. */
  onManual?: () => void;
}

/** The pick step: one dropzone, then the privacy note and the optional manual way out on one row. */
export function ImportPick({ onFile, intro, onManual }: Props) {
  const [error, setError] = useState<string | undefined>();

  return (
    <div className="space-y-4 font-mono">
      {intro && <p className="text-xs text-fg-muted">{intro}</p>}

      <FileDropzone
        accept="application/pdf,.pdf"
        maxBytes={MAX_PDF_BYTES}
        label="Drop your PDF here"
        actionLabel="Choose file"
        hint="PDF · up to 2 MB · 5 pages"
        error={error}
        onReject={(reason) => setError((reason === "too_big" ? IMPORT_ERRORS.file_too_big : IMPORT_ERRORS.not_pdf).message)}
        onFile={(file) => {
          setError(undefined);
          onFile(file);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-xs text-fg-muted">
          {/* padlock */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-fg-subtle"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>
            Read by AI.{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-fg"
            >
              Privacy
            </Link>
          </span>
        </p>

        {onManual && (
          <Button variant="secondary" size="sm" onClick={onManual}>
            Fill it in myself
          </Button>
        )}
      </div>
    </div>
  );
}
