import { Badge, Typewriter } from "../../ui";
import { PEOPLE, type DemoPerson } from "../landingContent";
import { DemoAvatar } from "./DemoAvatar";
import { after, appear, typingTime } from "./demoMotion";

// search matches names (not roles), so the demo searches a name
const QUERY = "Leo";
const SPEED = 140;
const START = 300;

// nearest first, the way you would want to reach them
const RESULTS: { person: DemoPerson; hops: string }[] = [
  { person: { name: "Leo Martins", title: "Engineering manager", face: 20 }, hops: "1 hop" },
  { person: PEOPLE.leo, hops: "2 hops" },
  { person: { name: "Leona Park", title: "Recruiter", face: 9 }, hops: "3 hops" },
];

/** Feature demo: a people search, every result showing how far away they are. */
export function SearchDemo({ play }: { play: boolean }) {
  const typed = typingTime(QUERY, SPEED, START);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2 border border-border bg-surface px-3 py-2 font-mono text-xs text-fg">
        <svg aria-hidden viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-fg-muted" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx={7} cy={7} r={4.5} />
          <path d="M10.5 10.5 14 14" strokeLinecap="round" />
        </svg>
        <Typewriter text={QUERY} play={play} speed={SPEED} delay={START} />
      </div>

      <ul className="flex flex-col">
        {RESULTS.map(({ person, hops }, i) => (
          <li key={person.name} className={`flex items-center gap-2.5 py-1.5 border-b border-border last:border-0 ${appear(play)}`}
              style={after(typed + 250 + i * 160)}>
            <DemoAvatar person={person} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-xs text-fg truncate">{person.name}</span>
              <span className="block font-mono text-[10px] text-fg-muted truncate">{person.title}</span>
            </span>
            <Badge>{hops}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
