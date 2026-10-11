import { Badge } from "../../ui";
import { PEOPLE, type DemoPerson } from "../landingContent";
import { DemoAvatar } from "./DemoAvatar";
import { after, appear } from "./demoMotion";

interface Spot {
  person: DemoPerson;
  x: number; // % of the stage
  y: number;
}

// the path, from you to the person you want to reach
const PATH: Spot[] = [
  { person: PEOPLE.maya, x: 9, y: 58 },
  { person: PEOPLE.arjun, x: 31, y: 28 },
  { person: PEOPLE.priya, x: 52, y: 64 },
  { person: PEOPLE.leo, x: 72, y: 30 },
  { person: PEOPLE.noah, x: 87, y: 60 },
];

// everyone else nearby, so the path has to be found rather than being the only route
const OTHERS: Spot[] = [
  { person: PEOPLE.sofia, x: 18, y: 88 },
  { person: PEOPLE.ava, x: 44, y: 12 },
  { person: PEOPLE.omar, x: 63, y: 90 },
  { person: PEOPLE.kai, x: 84, y: 10 },
];
const OTHER_LINKS: [Spot, Spot][] = [
  [PATH[0], OTHERS[0]],
  [OTHERS[0], PATH[2]],
  [PATH[1], OTHERS[1]],
  [OTHERS[1], PATH[3]],
  [PATH[2], OTHERS[2]],
  [PATH[3], OTHERS[3]],
];

const HOP_MS = 550;

/** Feature demo: the shortest chain from you to someone, drawn hop by hop. */
export function PathDemo({ play }: { play: boolean }) {
  return (
    <div className="relative h-full min-h-56">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full text-fg">
        {OTHER_LINKS.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity={0.15}
                strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        ))}
        {PATH.slice(1).map((spot, i) => {
          const from = PATH[i];
          return (
            <line key={i} x1={from.x} y1={from.y} x2={spot.x} y2={spot.y} stroke="currentColor" strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  className={`transition-opacity duration-500 ease-out motion-reduce:transition-none ${play ? "opacity-100" : "opacity-0"}`}
                  style={after(i * HOP_MS + 200)} />
          );
        })}
      </svg>

      {OTHERS.map((spot, i) => (
        <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2 opacity-50 grayscale"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
          <DemoAvatar person={spot.person} size="sm" />
        </span>
      ))}

      {PATH.map((spot, i) => (
        <span key={spot.person.name} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
          <span className={`rounded-full ring-offset-2 ring-offset-surface transition-shadow duration-300 motion-reduce:transition-none
                            ${play ? "ring-2 ring-fg" : "ring-0"}`}
                style={after(Math.max(0, i * HOP_MS))}>
            <DemoAvatar person={spot.person} />
          </span>
          <span className={`font-mono text-[10px] text-fg-muted whitespace-nowrap ${appear(play)}`}
                style={after(i * HOP_MS + 150)}>
            {i === 0 ? "You" : i === PATH.length - 1 ? spot.person.name : `Hop ${i}`}
          </span>
        </span>
      ))}

      <span className={`absolute right-0 bottom-0 ${appear(play, "opacity-0 scale-90")}`}
            style={after(PATH.length * HOP_MS)}>
        <Badge tone="contrast">{PATH.length - 1} hops</Badge>
      </span>
    </div>
  );
}
