"use client";

import { useState } from "react";
import { Button } from "../ui";
import { ResumeImportModal } from "../resume-import";
import { useCopyInviteLink } from "@/lib/hooks/useCopyInviteLink";

interface Props {
  /** Public slug used in the invite link. */
  userId: string | undefined;
  onEdit: () => void;
  /** Profile is empty, so prompt a resume import (imports only go into an empty profile). */
  canImport: boolean;
}

// Session-scoped on purpose: a closed prompt comes back on the next visit while the profile is still empty.
const PROMPT_DISMISSED_KEY = "resume-import-prompt-dismissed";

function promptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function dismissPrompt() {
  try {
    sessionStorage.setItem(PROMPT_DISMISSED_KEY, "1");
  } catch {
    // Storage blocked: the prompt just shows again next time, which is harmless.
  }
}

/**
 * The own-profile view-mode actions. In-flow rather than overlaid so it never
 * covers the header (name/title can run long, especially on mobile). Also owns
 * the empty-profile import prompt, mounted only while open so each open starts fresh.
 */
export function ProfileViewToolbar({ userId, onEdit, canImport }: Props) {
  // The invite link, not the plain profile link, so signups get referral-attributed.
  const { copied, copy } = useCopyInviteLink(userId);
  // Decided once on mount. The page only renders this after the profile query has
  // loaded on the client, so reading sessionStorage here can't cause a hydration mismatch.
  const [importing, setImporting] = useState(() => canImport && !promptDismissed());

  const closeImport = () => {
    dismissPrompt();
    setImporting(false);
  };

  const fillInManually = () => {
    closeImport();
    onEdit();
  };

  return (
    <div className="flex flex-wrap justify-end gap-2 mb-4">
      <Button variant="secondary" size="md" onClick={copy}>
        <span className="inline-flex items-center gap-1.5">
          <svg aria-hidden viewBox="0 0 24 24" width="14" height="14" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {copied ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </>
            )}
          </svg>
          {copied ? "Copied!" : "Invite friend"}
        </span>
      </Button>
      <Button variant="secondary" size="md" onClick={onEdit}>
        Edit
      </Button>

      {importing && <ResumeImportModal onClose={closeImport} onManual={fillInManually} />}
    </div>
  );
}
