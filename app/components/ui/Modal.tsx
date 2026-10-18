"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Off: backdrop, Escape and × can't close it, so a stray click can't lose the step. */
  dismissible?: boolean;
  /** Off: only Escape and × close it, so a stray click outside a long form can't discard it. */
  closeOnBackdrop?: boolean;
  size?: "md" | "lg";
  /** Multi-step dialogs: each new key moves focus to the title so the step's heading is announced. */
  focusKey?: string;
  /**
   * Where focus goes on close when the element that opened the modal is gone (it was
   * replaced while the modal was open). Without it, focus would fall back to the page.
   */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const SIZES = {
  md: "max-w-md",
  lg: "max-w-2xl",
} as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]):not([tabindex="-1"]), ' +
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), select:not([disabled]), ' +
  '[tabindex]:not([tabindex="-1"])';

/** Back to whatever opened the modal; if that is gone, to the fallback (read now, at close). */
function restoreFocus(opener: HTMLElement | null, fallback?: React.RefObject<HTMLElement | null>) {
  (opener?.isConnected ? opener : fallback?.current)?.focus();
}

/**
 * Owns the overlay, escape-to-close, scroll lock, focus trap, and ARIA wiring.
 *
 * It portals to document.body, and that is load-bearing rather than stylistic.
 * `CollapsibleBox` positions its expanded panel with a CSS transform, which makes
 * that element the containing block for every `position: fixed` descendant. A
 * modal rendered inside it therefore centred itself on the panel instead of the
 * viewport and was clipped by the panel's overflow. Portalling escapes the
 * transformed ancestor entirely.
 *
 * `onClose` and `dismissible` are read through refs so an inline `onClose` doesn't re-run the focus effect.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  dismissible = true,
  closeOnBackdrop = true,
  size = "md",
  focusKey,
  returnFocusRef,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  const titleId = useId();

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible;
  });

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusable = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // A control inside that handles Escape itself (closing its own dropdown) marks it
        // handled, and the modal stays open.
        if (event.defaultPrevented) return;
        event.stopPropagation();
        if (dismissibleRef.current) onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !panelRef.current?.contains(active);

      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    // Bubble phase, so a control inside sees Escape first and can claim it.
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      restoreFocus(previouslyFocused.current, returnFocusRef);
    };
  }, [isOpen, returnFocusRef]);

  // Declared after the effect above so `previouslyFocused` is captured before
  // focus moves into the panel.
  useEffect(() => {
    if (!isOpen) return;
    const target =
      focusKey !== undefined ? titleRef.current : panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
  }, [isOpen, focusKey]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => {
          if (dismissible && closeOnBackdrop) onClose();
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative bg-white border border-neutral-200 w-full ${SIZES[size]} shadow-lg
                  max-h-[calc(100dvh-2rem)] flex flex-col`}
      >
        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 font-mono text-neutral-400 hover:text-neutral-800
                     text-lg leading-none w-6 h-6 cursor-pointer"
          >
            ×
          </button>
        )}

        <h3
          id={titleId}
          ref={titleRef}
          tabIndex={-1}
          className="font-mono font-semibold text-neutral-800 px-6 pt-6 mb-1 pr-12 outline-none"
        >
          {title}
        </h3>

        <div className={`flex-1 min-h-0 overflow-y-auto px-6 ${footer ? "pb-1" : "pb-6"}`}>
          {children}
        </div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 px-6 pt-4 pb-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
