"use client";

import { useRouter } from "next/navigation";
import { useCanGoBack } from "@/lib/hooks/navigation";

interface BackButtonProps {
  /** Where to land when there's no in-app history to go back to. */
  fallbackHref?: string;
  label?: string;
}

/**
 * Returns to wherever the visitor came from (connection path, discover results,
 * dashboard, ...) instead of always dropping them on a fixed page. Falls back
 * only when there's no in-app history — e.g. the link was opened directly in a
 * new tab or from an external site.
 */
export function BackButton({ fallbackHref = "/dashboard", label = "Back" }: BackButtonProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const goBack = () => {
    if (canGoBack) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-2 font-mono text-sm text-neutral-500
               hover:text-neutral-800 transition-colors cursor-pointer"
    >
      <span aria-hidden>←</span> {label}
    </button>
  );
}
