import { Badge, Typewriter } from "../../ui";
import { PEOPLE } from "../landingContent";
import { DemoAvatar } from "./DemoAvatar";
import { after, appear } from "./demoMotion";

const CHAIN = [
  { person: PEOPLE.maya, label: "You" },
  { person: PEOPLE.priya, label: "Priya" },
  { person: PEOPLE.leo, label: "Leo" },
];
const HOP_MS = 600;
const MESSAGE = "Leo, meet Maya. You two should talk about design hiring.";

/** Step demo: the chain to someone, and the friend in the middle making the intro. */
export function IntroDemo({ play }: { play: boolean }) {
  const chainDone = CHAIN.length * HOP_MS;

  return (
    <div className="flex flex-col gap-5 h-full justify-center">
      <div className="flex items-center justify-between">
        {CHAIN.map(({ person, label }, i) => (
          <div key={person.name} className="contents">
            {i > 0 && (
              <span className="relative flex-1 mx-2 h-px bg-border overflow-hidden">
                <span className={`absolute inset-0 bg-fg origin-left transition-transform duration-500 motion-reduce:transition-none
                                  ${play ? "scale-x-100" : "scale-x-0"}`}
                      style={after(i * HOP_MS - 300)} />
              </span>
            )}
            <span className={`flex flex-col items-center gap-1.5 ${appear(play, "opacity-30")}`} style={after(i * HOP_MS)}>
              <DemoAvatar person={person} size="lg" tone={i === 0 ? "self" : "default"} />
              <span className="font-mono text-[10px] text-fg-muted">{label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className={`relative self-center max-w-xs border border-border bg-surface px-3 py-2.5 ${appear(play)}`} style={after(chainDone)}>
        <span className="flex items-center gap-2 mb-1.5">
          <DemoAvatar person={PEOPLE.priya} size="sm" />
          <span className="font-mono text-[10px] text-fg-subtle">Priya, to Leo</span>
        </span>
        <p className="font-mono text-xs text-fg-body leading-relaxed">
          <Typewriter text={MESSAGE} play={play} speed={28} delay={chainDone + 300} />
        </p>
      </div>

      <span className={`self-center ${appear(play, "opacity-0 scale-90")}`} style={after(chainDone + 300 + MESSAGE.length * 28 + 300)}>
        <Badge tone="contrast">2 hops to Leo</Badge>
      </span>
    </div>
  );
}
