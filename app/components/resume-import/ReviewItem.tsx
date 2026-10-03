import { Checkbox } from "../ui";

interface Props {
  /** Names the item, so a screen reader hears what the tick applies to. */
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
  /** Shows the "double check it" hint. */
  unsure?: boolean;
  /** Editable fields, shown while the item is ticked. */
  children?: React.ReactNode;
}

/** One tickable row in the import review. */
export function ReviewItem({ label, checked, onToggle, disabled = false, unsure = false, children }: Props) {
  return (
    <div className="space-y-2">
      <Checkbox label={label} checked={checked} onChange={onToggle} disabled={disabled} />
      {unsure && <p className="font-mono text-xs text-warning pl-5">Not sure about this one. Double check it.</p>}
      {checked && children && <div className="pl-5">{children}</div>}
    </div>
  );
}
