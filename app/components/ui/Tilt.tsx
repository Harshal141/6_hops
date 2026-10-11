"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface TiltProps {
  children: React.ReactNode;
  /** Largest lean, in degrees, at the edges. */
  max?: number;
}

/** Leans its content toward the cursor in 3D, and settles back when it leaves. Off with reduced motion. */
export function Tilt({ children, max = 6 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const lean = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reducedMotion || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
  };

  const settle = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div className="[perspective:1000px] h-full" onPointerMove={lean} onPointerLeave={settle}>
      <div ref={ref} className="h-full transition-transform duration-300 ease-out [transform-style:preserve-3d]">
        {children}
      </div>
    </div>
  );
}
