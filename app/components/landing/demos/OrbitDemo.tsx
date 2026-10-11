import { PEOPLE } from "../landingContent";
import { DemoAvatar } from "./DemoAvatar";

const RING = [PEOPLE.arjun, PEOPLE.priya, PEOPLE.leo, PEOPLE.sofia, PEOPLE.noah, PEOPLE.omar];
const RADIUS = 104; // px

/**
 * Feature demo: your connections circling you in 3D. The ring spins and each
 * face counter-spins by the same amount, so people stay upright and facing
 * out of the screen while they travel round the back.
 */
export function OrbitDemo({ play }: { play: boolean }) {
  const paused = play ? "" : "[animation-play-state:paused]";

  return (
    <div className="relative h-full min-h-56 flex items-center justify-center [perspective:700px]">
      <div className="relative [transform-style:preserve-3d] [transform:rotateX(-24deg)]">
        {/* the orbit itself, lying flat */}
        <span
          aria-hidden
          className="absolute border border-dashed border-fg-subtle rounded-full [transform:translate(-50%,-50%)_rotateX(90deg)]"
          style={{ width: RADIUS * 2, height: RADIUS * 2 }}
        />
        <div className={`[transform-style:preserve-3d] motion-safe:animate-[orbit-spin_16s_linear_infinite] ${paused}`}>
          {RING.map((person, i) => {
            const angle = (360 / RING.length) * i;
            return (
              <div
                key={person.name}
                className="absolute [transform-style:preserve-3d]"
                style={{ transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)` }}
              >
                <div
                  className={`motion-safe:animate-[orbit-counter_16s_linear_infinite] ${paused}`}
                  style={{ "--angle": `${angle}deg` } as React.CSSProperties}
                >
                  <div className="-translate-x-1/2 -translate-y-1/2">
                    <DemoAvatar person={person} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute -translate-x-1/2 -translate-y-1/2">
          <DemoAvatar person={PEOPLE.maya} tone="self" size="lg" />
        </div>
      </div>
    </div>
  );
}
