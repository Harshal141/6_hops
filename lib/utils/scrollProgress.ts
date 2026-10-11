/**
 * How far an element has been scrolled through, 0..1, measured against a
 * line across the viewport (`anchor`, as a fraction of its height from the
 * top). 0 while the element's top is still below the line, 1 once its bottom
 * has passed above it.
 */
export function scrollProgress(top: number, height: number, viewportHeight: number, anchor = 0.6): number {
  if (height <= 0) return 0;
  const passed = viewportHeight * anchor - top;
  return Math.min(1, Math.max(0, passed / height));
}

/**
 * Which of `count` evenly spaced steps a progress value has reached, -1 for
 * none yet. Step i is reached at progress i / count, so the first step lights
 * up as soon as the element reaches the line.
 */
export function reachedStep(progress: number, count: number): number {
  if (count <= 0 || progress <= 0) return -1;
  return Math.min(count - 1, Math.floor(progress * count));
}
