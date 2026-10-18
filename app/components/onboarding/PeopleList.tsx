import { ConnectionStatusAction } from "../connections";
import type { ConnectionStatus } from "@/lib/hooks/connection";
import { PersonCard } from "./PersonCard";

export interface PersonItem {
  id: string;
  name: string;
  icon: string | null;
  subtitle: string | null;
  meta?: string;
  status: ConnectionStatus;
}

interface PeopleListProps {
  people: PersonItem[];
  onConnect: (person: PersonItem) => void;
}

/**
 * Suggested or searched people with their connect action: rows on mobile, a grid from `sm`.
 * The column templates are explicit at both sizes (`grid-cols-1` is `minmax(0, 1fr)`), and
 * each cell may shrink below its content, so a long headline truncates instead of stretching
 * the row past the screen.
 */
export function PeopleList({ people, onConnect }: PeopleListProps) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
      {people.map((person) => (
        <li key={person.id} className="min-w-0">
          <PersonCard
            name={person.name}
            icon={person.icon}
            subtitle={person.subtitle}
            meta={person.meta}
            action={
              <ConnectionStatusAction
                status={person.status}
                targetName={person.name}
                variant="secondary"
                sentLabel="✓ Request sent"
                onConnect={() => onConnect(person)}
              />
            }
          />
        </li>
      ))}
    </ul>
  );
}
