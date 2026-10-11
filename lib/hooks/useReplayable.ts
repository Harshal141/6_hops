import { useCallback, useRef, useState } from "react";

/**
 * Playback for an animation that runs when `ready` (typically "scrolled into
 * view") and can be run again on demand.
 *
 * Replaying has to go through a frame with `play` false, or CSS transitions
 * have nothing to transition from. `runId` changes on each replay: use it as
 * the animated subtree's `key`, so components with their own progress state
 * (a typewriter) start over too.
 */
export function useReplayable(ready: boolean) {
  const [armed, setArmed] = useState(true);
  const [runId, setRunId] = useState(0);
  const pending = useRef(false);

  const replay = useCallback(() => {
    if (pending.current) return;
    pending.current = true;
    setArmed(false);
    setRunId((id) => id + 1);
    // two frames: one to commit the reset state, one to start from it
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        pending.current = false;
        setArmed(true);
      })
    );
  }, []);

  return { play: ready && armed, runId, replay };
}
