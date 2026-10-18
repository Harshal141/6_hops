import { Button } from "../ui";

interface Props {
  error?: string;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  /** Off: just the error and buttons, for a container that lays them out itself (a modal footer). */
  framed?: boolean;
}

/** Edit mode's save bar: in flow on the profile page, so it never overlaps the header inputs. */
export function ProfileEditToolbar({ error, saving, onCancel, onSave, framed = true }: Props) {
  const content = (
    <>
      {error && <span role="alert" className="font-mono text-xs text-danger mr-auto">{error}</span>}
      <Button variant="secondary" size="md" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button variant="primary" size="md" onClick={onSave} loading={saving}>
        Save
      </Button>
    </>
  );
  if (!framed) return content;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mb-6 pb-4 border-b border-neutral-100">
      {content}
    </div>
  );
}
