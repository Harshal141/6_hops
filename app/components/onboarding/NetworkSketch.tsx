import { Avatar } from "../ui";

export interface SketchPerson {
  id: string;
  name: string;
  icon: string | null;
  /** A request still waiting (dashed line) rather than an accepted connection (solid). */
  pending: boolean;
}

interface NetworkSketchProps {
  me: { name: string; icon: string | null };
  /** Up to three are drawn; the rest are summed up in the caption. */
  people: SketchPerson[];
}

// Positions as percentages of the sketch, so it scales with its box.
const CENTRE = { x: 50, y: 50 };
const SLOTS = [
  { x: 21, y: 24 },
  { x: 81, y: 28 },
  { x: 18, y: 78 },
];
const PLUS = { x: 74, y: 80 };
// Faint friends-of-friends hanging off each slot, for texture.
const FAINT = [
  { slot: 0, x: 9, y: 60 },
  { slot: 0, x: 32, y: 8 },
  { slot: 1, x: 94, y: 52 },
];

const at = ({ x, y }: { x: number; y: number }) => ({ left: `${x}%`, top: `${y}%` });

/**
 * "You" in the middle, lines out to the people you asked (dashed while pending) and a
 * dashed "+" for whoever is next. Built from real requests and connections; with none it
 * is just you and the "+".
 */
export function NetworkSketch({ me, people }: NetworkSketchProps) {
  const shown = people.slice(0, SLOTS.length);
  const pendingCount = people.filter((person) => person.pending).length;
  const caption =
    people.length === 0
      ? "Your network"
      : pendingCount > 0
        ? `Your network · ${pendingCount} pending`
        : "Your network · 1 hop";

  return (
    <div
      role="img"
      aria-label={
        people.length === 0
          ? "Your network: just you so far"
          : `Your network: you and ${people.length} ${people.length === 1 ? "person" : "people"}`
      }
      className="relative h-[170px] sm:h-[250px] w-full border border-border bg-surface
                 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-[length:12px_12px]"
    >
      <svg aria-hidden className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {FAINT.filter(({ slot }) => slot < shown.length).map(({ slot, x, y }) => (
          <line
            key={`${x}-${y}`}
            x1={SLOTS[slot].x} y1={SLOTS[slot].y} x2={x} y2={y}
            className="stroke-fg-placeholder" strokeWidth={1} vectorEffect="non-scaling-stroke"
          />
        ))}
        {shown.map((person, index) => (
          <line
            key={person.id}
            x1={CENTRE.x} y1={CENTRE.y} x2={SLOTS[index].x} y2={SLOTS[index].y}
            className="stroke-accent" strokeWidth={1.5} vectorEffect="non-scaling-stroke"
            strokeDasharray={person.pending ? "4 4" : undefined}
          />
        ))}
        <line
          x1={CENTRE.x} y1={CENTRE.y} x2={PLUS.x} y2={PLUS.y}
          className="stroke-fg-subtle" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeDasharray="2 5"
        />
      </svg>

      {FAINT.filter(({ slot }) => slot < shown.length).map(({ x, y }) => (
        <span
          key={`${x}-${y}`}
          aria-hidden
          className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg-placeholder"
          style={at({ x, y })}
        />
      ))}
      {shown.map((person, index) => (
        <span key={person.id} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2" style={at(SLOTS[index])}>
          <Avatar src={person.icon} name={person.name} size="sm" />
        </span>
      ))}
      <span
        aria-hidden
        className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface
                   border-[1.5px] border-dashed border-fg-subtle flex items-center justify-center text-sm text-fg-muted"
        style={at(PLUS)}
      >
        +
      </span>
      <span
        aria-hidden
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-[6px] ring-accent/15"
        style={at(CENTRE)}
      >
        <Avatar src={me.icon} name={me.name || "You"} size="lg" tone="self" />
      </span>
      <span aria-hidden className="absolute left-2.5 bottom-2 text-[10px] text-fg-muted">
        {caption}
      </span>
    </div>
  );
}
