import { Badge, Button } from "../../ui";
import { PEOPLE } from "../landingContent";
import { DemoAvatar } from "./DemoAvatar";
import { after, appear } from "./demoMotion";

const LINK = "6-hops.vercel.app/invite/maya";
const COPIED_AT = 700;
const JOINERS = [PEOPLE.ava, PEOPLE.omar, PEOPLE.sofia];

/** Feature demo: you share your link, and friends arrive connected to you. */
export function InviteDemo({ play }: { play: boolean }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8 h-full">
      <div className="flex items-stretch min-w-0 w-full max-w-xs lg:max-w-[15rem]">
        <span className="min-w-0 flex-1 truncate border border-r-0 border-border bg-surface px-3 py-1.5 font-mono text-xs text-fg-body">
          {LINK}
        </span>
        {/* two labels in the same box, crossfading, so the width never jumps */}
        <span className="relative grid">
          <span className={`[grid-area:1/1] transition-opacity duration-300 ${play ? "opacity-0" : "opacity-100"}`} style={after(COPIED_AT)}>
            <Button decorative variant="primary">Copy</Button>
          </span>
          <span className={`[grid-area:1/1] transition-opacity duration-300 ${play ? "opacity-100" : "opacity-0"}`} style={after(COPIED_AT)}>
            <Button decorative variant="primary">Copied</Button>
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <DemoAvatar person={PEOPLE.maya} tone="self" />
        <span className="w-4 border-t border-dashed border-fg-subtle" />
        <div className="flex -space-x-2">
          {JOINERS.map((person, i) => (
            <span key={person.name} className={appear(play, "opacity-0 translate-x-6")} style={after(COPIED_AT + 500 + i * 350)}>
              <DemoAvatar person={person} />
            </span>
          ))}
        </div>
        <span className={appear(play, "opacity-0 scale-90")} style={after(COPIED_AT + 500 + JOINERS.length * 350)}>
          <Badge tone="contrast">+{JOINERS.length} joined</Badge>
        </span>
      </div>
    </div>
  );
}
