import { ReviewItem } from "./ReviewItem";
import { ReviewSection } from "./ReviewSection";
import type { ReviewItemMeta } from "@/lib/utils/resumeImportDraft";

interface Props<T extends ReviewItemMeta> {
  title: string;
  items: T[];
  /** item key → ticked. */
  selected: Record<string, boolean>;
  onToggle: (key: string, checked: boolean) => void;
  /** The checkbox label, naming the item. */
  label: (item: T) => string;
  /** Editable fields for a ticked item. Omit for tick-only rows. */
  renderFields?: (item: T) => React.ReactNode;
  disabled?: boolean;
}

/** A review section of tickable items: experience, education and links all render through this. */
export function ReviewListSection<T extends ReviewItemMeta>({
  title,
  items,
  selected,
  onToggle,
  label,
  renderFields,
  disabled = false,
}: Props<T>) {
  if (items.length === 0) return null;

  return (
    <ReviewSection title={title}>
      <div className={renderFields ? "space-y-4" : "space-y-2"}>
        {items.map((item) => (
          <ReviewItem
            key={item.key}
            label={label(item)}
            checked={selected[item.key] === true}
            onToggle={(checked) => onToggle(item.key, checked)}
            unsure={item.low_confidence}
            disabled={disabled}
          >
            {renderFields?.(item)}
          </ReviewItem>
        ))}
      </div>
    </ReviewSection>
  );
}
