import { Checkbox, Input, Textarea } from "../ui";
import { ReviewItem } from "./ReviewItem";
import { ReviewSection } from "./ReviewSection";
import {
  NAME_KEY,
  isSelected,
  setSelected,
  type ProfileField,
  type ReviewState,
} from "@/lib/utils/resumeImportDraft";

const PROFILE_ROWS: { field: ProfileField; label: string }[] = [
  { field: "title", label: "Headline" },
  { field: "location", label: "Location" },
  { field: "bio", label: "About" },
];

interface Props {
  state: ReviewState;
  onChange: (state: ReviewState) => void;
  disabled?: boolean;
}

/** The review's "about you" group: the display name and the profile's headline, location and bio. */
export function ReviewAboutSection({ state, onChange, disabled = false }: Props) {
  // Rows come from the selection map, not the live value, so clearing a field doesn't remove its row.
  const rows = PROFILE_ROWS.filter(({ field }) => field in state.selected.profile);
  if (!state.fullName && rows.length === 0) return null;

  const setField = (field: ProfileField, value: string) =>
    onChange({ ...state, profile: { ...state.profile, [field]: value } });

  return (
    <ReviewSection title="About you">
      <div className="space-y-3">
        {state.fullName && (
          <Checkbox
            label={`Use "${state.fullName}" as your display name`}
            checked={isSelected(state, "name", NAME_KEY)}
            onChange={(checked) => onChange(setSelected(state, "name", NAME_KEY, checked))}
            disabled={disabled}
          />
        )}
        {rows.map(({ field, label }) => (
          <ReviewItem
            key={field}
            label={label}
            checked={isSelected(state, "profile", field)}
            onToggle={(checked) => onChange(setSelected(state, "profile", field, checked))}
            disabled={disabled}
          >
            {field === "bio" ? (
              <Textarea
                size="sm"
                rows={3}
                value={state.profile.bio}
                onChange={(value) => setField("bio", value)}
                ariaLabel={label}
                disabled={disabled}
              />
            ) : (
              <Input size="sm" value={state.profile[field]} onChange={(value) => setField(field, value)} ariaLabel={label} disabled={disabled} />
            )}
          </ReviewItem>
        ))}
      </div>
    </ReviewSection>
  );
}
