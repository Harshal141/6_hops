"use client";

import { useId, useRef, useState } from "react";

type FileRejectReason = "too_big" | "wrong_type";

interface FileDropzoneProps {
  /** Same syntax as the input's `accept`, e.g. "application/pdf,.pdf". Also checked on drop. */
  accept?: string;
  /** Files larger than this are rejected here and never reach `onFile`. */
  maxBytes?: number;
  onFile: (file: File) => void;
  /** Called instead of `onFile` when a file fails `accept` or `maxBytes`. The caller owns the copy. */
  onReject?: (reason: FileRejectReason) => void;
  error?: string;
  /** The main line, e.g. "Drop your PDF here". */
  label: string;
  /** Text of the button-styled cue under the label, e.g. "Choose file". */
  actionLabel?: string;
  /** The smallest line: limits or accepted types. */
  hint?: string;
}

/** Cloud with an up arrow. Inline so the primitive needs no icon library. */
function UploadIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={28}
      height={28}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 7.97" />
      <path d="M12 12v8" />
      <path d="m8.5 15.5 3.5-3.5 3.5 3.5" />
    </svg>
  );
}

/** True when `file` matches one of the comma-separated `accept` entries. */
function matchesAccept(file: File, accept: string): boolean {
  const entries = accept.split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean);
  if (entries.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return entries.some((entry) => {
    if (entry.startsWith(".")) return name.endsWith(entry);
    return type === entry;
  });
}

/**
 * A file picker. The real `<input type="file">` is visually hidden behind a
 * focusable trigger that opens it on click, Enter, or Space; drag and drop is
 * an enhancement on top, never the only way in.
 */
export function FileDropzone({
  accept,
  maxBytes,
  onFile,
  onReject,
  error,
  label,
  actionLabel,
  hint,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const errorId = useId();

  const take = (file: File | undefined) => {
    if (!file) return;
    if (accept && !matchesAccept(file, accept)) return onReject?.("wrong_type");
    if (maxBytes !== undefined && file.size > maxBytes) return onReject?.("too_big");
    onFile(file);
  };

  const open = () => inputRef.current?.click();

  const surface = dragging
    ? "border-solid border-neutral-800 bg-neutral-100 text-neutral-800"
    : error
      ? "border-red-300 bg-white text-neutral-600"
      : "border-neutral-300 bg-white text-neutral-600";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-describedby={error ? errorId : undefined}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          // dragleave also fires when the pointer moves onto a child (the icon, a
          // line of text); only a real exit from the zone ends the drag state.
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          take(event.dataTransfer.files?.[0]);
        }}
        className={`group flex flex-col items-center justify-center gap-1.5 px-4 py-6 text-center
                  font-mono border-2 border-dashed outline-none transition-colors
                  focus-visible:border-solid focus-visible:border-neutral-800 focus-visible:bg-neutral-50
                  ${surface} cursor-pointer hover:border-neutral-500 hover:bg-neutral-50 hover:text-neutral-800`}
      >
        <span
          className="mb-1 flex items-center justify-center w-11 h-11 rounded-full border border-neutral-200
                     bg-neutral-50 text-neutral-700 transition-colors group-hover:border-neutral-400"
        >
          <UploadIcon />
        </span>
        <span className="text-sm font-semibold text-neutral-800">{label}</span>
        {actionLabel && (
          // A cue, not a second button: the whole zone is the button, and nested
          // interactive elements would trip screen readers and double-fire clicks.
          <span
            className="mt-1 px-3 py-1 text-xs border border-neutral-800 text-neutral-800 bg-white
                       transition-colors group-hover:bg-neutral-800 group-hover:text-white"
          >
            {actionLabel}
          </span>
        )}
        {hint && (
          <span className="mt-1 text-[11px] text-neutral-400">
            {hint}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={(event) => {
          take(event.target.files?.[0]);
          // cleared so picking the same file again still fires a change
          event.target.value = "";
        }}
      />

      {error && (
        <p id={errorId} role="alert" className="font-mono text-xs text-danger mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
