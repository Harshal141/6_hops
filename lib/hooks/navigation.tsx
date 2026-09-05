"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

const CanGoBackContext = createContext(false);

/**
 * `window.history.length > 1` can't tell in-app history from a referring site —
 * opening a page from an external link (e.g. a Google result) already gives a
 * history length of 2, so `router.back()` would exit the app. Instead this
 * tracks whether the pathname has changed at least once since this JS runtime
 * loaded: true only after a real in-app navigation, false on a fresh load
 * regardless of what the browser's history stack looks like.
 *
 * Comparing against the previous render's pathname and setting state directly
 * in the render body (rather than in an effect) is the documented pattern for
 * "adjusting state when a prop changes" — it avoids the extra commit an
 * effect-based version would cause.
 */
export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [canGoBack, setCanGoBack] = useState(false);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setCanGoBack(true);
  }

  return <CanGoBackContext.Provider value={canGoBack}>{children}</CanGoBackContext.Provider>;
}

/** Whether the user has navigated in-app since this page load — safe to `router.back()` when true. */
export function useCanGoBack() {
  return useContext(CanGoBackContext);
}
