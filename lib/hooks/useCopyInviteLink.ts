"use client";

import { useState } from "react";

/** Copies a referral-attributed invite link (`/invite/<userId>`), arming a brief "copied" flag. */
export function useCopyInviteLink(userId: string | undefined) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/invite/${userId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("[invite] failed to copy invite link:", err);
    }
  };

  return { copied, copy };
}
