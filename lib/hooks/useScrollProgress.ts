import { useEffect, useRef, useState } from "react";
import { scrollProgress } from "@/lib/utils/scrollProgress";

/**
 * How far the referenced element has been scrolled through, 0..1 (see
 * `scrollProgress`). Read once per frame at most, and only re-renders when
 * the value moves by a visible amount.
 */
export function useScrollProgress<T extends HTMLElement>(anchor = 0.6) {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = scrollProgress(rect.top, rect.height, window.innerHeight, anchor);
      setProgress((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [anchor]);

  return { ref, progress };
}
