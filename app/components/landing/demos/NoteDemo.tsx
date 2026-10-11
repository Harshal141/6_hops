import { Badge, Button, Typewriter } from "../../ui";
import { PEOPLE, type DemoPerson } from "../landingContent";
import { DemoAvatar } from "./DemoAvatar";
import { after, appear, pressAt, typingTime } from "./demoMotion";

const SPEED = 32;
const START = 400;

interface NoteDemoProps {
  play: boolean;
  person?: DemoPerson;
  note?: string;
}

/**
 * A connection request, with the note that makes it a strong one: the note
 * types out, the button is pressed and reads "Sent", then they accept.
 */
export function NoteDemo({
  play,
  person = PEOPLE.arjun,
  note = "We shipped the payments launch together. He is the first person I call.",
}: NoteDemoProps) {
  const sentAt = typingTime(note, SPEED, START) + 400;
  const firstName = person.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <DemoAvatar person={person} />
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-fg truncate">{person.name}</p>
          <p className="font-mono text-xs text-fg-muted truncate">{person.title}</p>
        </div>
      </div>

      <div className="border border-border bg-surface px-3 py-2.5">
        <p className="font-mono text-[10px] text-fg-subtle mb-1">Why is {firstName} a strong connection?</p>
        <p className="font-mono text-xs text-fg-body leading-relaxed min-h-[3.2em]">
          <Typewriter text={note} play={play} speed={SPEED} delay={START} />
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* two labels in one box, crossfading at the press, so the width never jumps */}
        <span className="relative grid" style={pressAt(play, sentAt)}>
          <span className={`[grid-area:1/1] transition-opacity duration-200 ${play ? "opacity-0" : "opacity-100"}`} style={after(sentAt)}>
            <Button decorative variant="primary" size="sm">Send request</Button>
          </span>
          <span className={`[grid-area:1/1] transition-opacity duration-200 ${play ? "opacity-100" : "opacity-0"}`} style={after(sentAt)}>
            <Button decorative variant="secondary" size="sm">Sent</Button>
          </span>
        </span>
        <span className={appear(play, "opacity-0 translate-x-2")} style={after(sentAt + 900)}>
          <Badge tone="contrast">Accepted</Badge>
        </span>
      </div>
    </div>
  );
}
