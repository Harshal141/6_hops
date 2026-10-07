import { Button } from "../ui";

interface Props {
  error?: string;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

/** Edit mode's in-flow bar, so it never overlaps the header inputs. */
export function ProfileEditToolbar({ error, saving, onCancel, onSave }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mb-6 pb-4 border-b border-neutral-100">
      {error && <span role="alert" className="font-mono text-xs text-danger mr-auto">{error}</span>}
      <Button variant="secondary" size="md" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button variant="primary" size="md" onClick={onSave} loading={saving}>
        Save
      </Button>
    </div>
  );
}
