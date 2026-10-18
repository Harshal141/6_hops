"use client";

import { useState, useSyncExternalStore } from "react";
import { SITE } from "@/app/siteMeta";

const noSubscribe = () => () => {};

/**
 * A referral-attributed invite link (`/invite/<userId>`) and a copier that arms a brief
 * "copied" flag. The server render uses the canonical site URL; the browser swaps in its
 * own origin, so a preview deployment hands out links to itself.
 */
export function useCopyInviteLink(userId: string | undefined) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => SITE.url,
  );
  const link = userId ? `${origin}/invite/${userId}` : "";

  /** Resolves true once the link is on the clipboard. */
  const copy = async (): Promise<boolean> => {
    if (!link) return false;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return true;
    } catch (err) {
      console.error("[invite] failed to copy invite link:", err);
      return false;
    }
  };

  return { copied, copy, link };
}
