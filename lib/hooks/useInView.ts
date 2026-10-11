import { useEffect, useRef, useState } from "react";

interface InViewOptions {
  /** Share of the element that must be visible, 0..1. */
  threshold?: number;
  /** Stay true after the first time it is seen. */
  once?: boolean;
}

/** Whether an element is on screen. For scroll-in reveals and demos that should only play when seen. */
export function useInView<T extends Element>({ threshold = 0.25, once = true }: InViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}
