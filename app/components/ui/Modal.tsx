"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Owns the overlay, escape-to-close, scroll lock, focus trap, and ARIA wiring.
 *
 * It portals to document.body, and that is load-bearing rather than stylistic.
 * `CollapsibleBox` positions its expanded panel with a CSS transform, which makes
 * that element the containing block for every `position: fixed` descendant. A
 * modal rendered inside it therefore centred itself on the panel instead of the
 * viewport and was clipped by the panel's overflow — the same component behaved
 * correctly on a plain page and wrongly inside the dashboard. Portalling escapes
 * the transformed ancestor entirely.
 */
export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white border border-neutral-200 p-6 w-full max-w-md mx-4 shadow-lg"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 font-mono text-neutral-400 hover:text-neutral-800
                   text-lg leading-none w-6 h-6 cursor-pointer"
        >
          ×
        </button>

        <h3 id="modal-title" className="font-mono font-semibold text-neutral-800 mb-1 pr-6">
          {title}
        </h3>

        {children}

        {footer && <div className="flex justify-end gap-2 mt-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
