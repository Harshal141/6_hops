import { Badge, Chip } from "../../ui";
import { after, appear } from "./demoMotion";

const SCAN_MS = 1400;

const FOUND = [
  { label: "Experience", value: "Product designer" },
  { label: "Education", value: "Bachelor of design" },
];
const SKILLS = ["Figma", "Research", "Prototyping"];

/** Feature demo: a resume PDF being read into profile fields you can review. */
export function ResumeDemo({ play }: { play: boolean }) {
  return (
    <div className="flex gap-4 h-full">
      {/* the page being read */}
      <div className="relative w-20 shrink-0 self-start border border-border bg-surface px-2 pt-3 pb-4 overflow-hidden">
        <span className="absolute top-1 right-1 font-mono text-[8px] text-fg-subtle">PDF</span>
        <span className="block h-1.5 w-3/4 bg-fg-placeholder mb-2" />
        {[100, 85, 92, 60, 88, 70, 95, 50].map((w, i) => (
          <span key={i} className="block h-1 bg-border mb-1.5" style={{ width: `${w}%` }} />
        ))}
        {play && (
          <span aria-hidden className="absolute inset-x-0 h-6 -translate-y-1/2 bg-gradient-to-b from-transparent via-fg/10 to-transparent
                                       border-b border-fg/40 motion-safe:animate-[scan_1.4s_ease-in-out_1_forwards] motion-reduce:hidden" />
        )}
      </div>

      {/* what it found */}
      <div className="flex-1 min-w-0 flex flex-col gap-2.5">
        {FOUND.map((item, i) => (
          <div key={item.label} className={appear(play)} style={after(SCAN_MS * 0.4 + i * 300)}>
            <p className="font-mono text-[10px] text-fg-subtle">{item.label}</p>
            <p className="font-mono text-xs text-fg truncate">{item.value}</p>
          </div>
        ))}
        <div className={`flex flex-wrap gap-1.5 ${appear(play)}`} style={after(SCAN_MS * 0.4 + 600)}>
          {SKILLS.map((skill) => (
            <Chip key={skill} label={skill} />
          ))}
        </div>
        <span className={`mt-auto ${appear(play, "opacity-0 translate-x-2")}`} style={after(SCAN_MS + 500)}>
          <Badge tone="contrast">Ready to review</Badge>
        </span>
      </div>
    </div>
  );
}
