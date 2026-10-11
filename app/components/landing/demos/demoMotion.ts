/**
 * Shared timing for the landing demos. Each demo is a still picture of the
 * app whose parts arrive in order once `play` turns true; with reduced motion
 * they simply appear.
 */

/** Classes for a part that fades in (from `hidden`) when `play` is true. */
export function appear(play: boolean, hidden = "opacity-0 translate-y-2") {
  return `transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none
          ${play ? "opacity-100 translate-x-0 translate-y-0 scale-100" : hidden}`;
}

/** Inline style that holds a transition back by `ms`. */
export function after(ms: number): React.CSSProperties {
  return { transitionDelay: `${ms}ms` };
}

/**
 * Inline style for a quick press-and-release (a click) at `ms`. Uses the
 * `press` keyframes, which globals.css only defines when motion is allowed.
 */
export function pressAt(play: boolean, ms: number): React.CSSProperties {
  return play ? { animation: `press 220ms ease-out ${ms}ms 1 both` } : {};
}

/** Milliseconds a Typewriter takes to finish `text` at `speed` ms per character. */
export function typingTime(text: string, speed: number, delay = 0) {
  return delay + text.length * speed;
}
