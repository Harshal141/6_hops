"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastTone = "success" | "error";

interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

type ShowToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast | null>(null);

const VISIBLE_MS = 4000;

const TONES: Record<ToastTone, string> = {
  success: "border-neutral-800 bg-neutral-900 text-white",
  error: "border-red-300 bg-white text-red-600",
};

/**
 * One toast at a time, bottom-centre. A new toast replaces the current one rather than
 * stacking: the app only ever reports the outcome of the last action.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);

  const show = useCallback<ShowToast>((message, tone = "success") => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* The live region is always mounted so screen readers announce each new message. */}
      <div
        role="status"
        className="pointer-events-none fixed inset-x-0 z-[110] flex justify-center px-4
                   bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      >
        {toast && (
          <div
            key={toast.id}
            className={`pointer-events-auto max-w-sm border px-4 py-2.5 font-mono text-sm shadow-lg
                        motion-safe:animate-[toast-in_150ms_ease-out] ${TONES[toast.tone]}`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

/** Returns `show(message, tone?)`. Must be used under `ToastProvider` (mounted in the root layout). */
export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside ToastProvider");
  return show;
}
