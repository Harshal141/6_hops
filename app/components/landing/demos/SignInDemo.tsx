import { Badge, Button } from "../../ui";
import { PEOPLE } from "../landingContent";
import { DemoAvatar } from "./DemoAvatar";
import { after, appear, pressAt } from "./demoMotion";

const CLICK_AT = 900;

/** Step demo: one click on a provider button, and your profile is there. */
export function SignInDemo({ play }: { play: boolean }) {
  return (
    <div className="relative flex flex-col gap-3 h-full justify-center py-2">
      <div className="flex flex-col gap-2.5">
        <span className="block" style={pressAt(play, CLICK_AT)}>
          <Button decorative variant="primary" size="lg" fullWidth>Continue with LinkedIn</Button>
        </span>
        <Button decorative variant="secondary" size="lg" fullWidth>Continue with Google</Button>
      </div>

      {/* the pointer travels to the first button and clicks it */}
      <svg
        aria-hidden
        viewBox="0 0 16 20"
        className={`absolute w-5 h-6 text-fg drop-shadow transition-[left,top,opacity] duration-700 ease-out motion-reduce:hidden
                    ${play ? "left-[58%] top-[30%] opacity-0" : "left-[88%] top-[85%] opacity-100"}`}
        // moves first; the opacity half of the transition waits until after the click
        style={{ transitionDelay: `0ms, 0ms, ${CLICK_AT + 500}ms` }}
      >
        <path d="M1 1 L1 15 L5 11.5 L8 18 L10.5 17 L7.5 10.5 L13 10.5 Z" fill="var(--color-surface)" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>

      <div className={`flex items-center gap-3 border border-border bg-surface px-3 py-2.5 ${appear(play)}`} style={after(CLICK_AT + 400)}>
        <DemoAvatar person={PEOPLE.maya} />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-sm text-fg truncate">{PEOPLE.maya.name}</span>
          <span className="block font-mono text-[10px] text-fg-muted truncate">{PEOPLE.maya.title}</span>
        </span>
        <Badge tone="contrast">Signed in</Badge>
      </div>
    </div>
  );
}
