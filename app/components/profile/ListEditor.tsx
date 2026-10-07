"use client";

import { useFieldArray, useFormContext, type FieldArray } from "react-hook-form";
import { Button } from "../ui";
import type { ProfileFormValues } from "@/lib/schemas/profile";
import { ProfileSection } from "./ProfileSection";
import { PROFILE_TEXT } from "./profileText";

type ListName = "links" | "experience" | "education";

interface Props<N extends ListName> {
  title: string;
  name: N;
  max: number;
  /** What "+ Add" appends. */
  blank: FieldArray<ProfileFormValues, N>;
  empty: string;
  renderRow: (index: number, remove: () => void) => React.ReactNode;
  rowClassName?: string;
}

/**
 * One editable list section of the profile form: rows, add (disabled at the limit), remove,
 * and the list-level error. Each section supplies only its row.
 */
export function ListEditor<N extends ListName>({ title, name, max, blank, empty, renderRow, rowClassName }: Props<N>) {
  const { control, formState } = useFormContext<ProfileFormValues>();
  // keyName: rows carry their own `id` (the DB id), which useFieldArray would otherwise overwrite
  const { fields, append, remove } = useFieldArray({ control, name, keyName: "key" });
  const atLimit = fields.length >= max;
  const listError = formState.errors[name]?.root?.message ?? formState.errors[name]?.message;

  return (
    <ProfileSection
      title={title}
      action={
        <Button variant="secondary" size="sm" disabled={atLimit} onClick={() => append(blank)}>
          + Add
        </Button>
      }
    >
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.key} className={rowClassName}>
            {renderRow(index, () => remove(index))}
          </div>
        ))}
        {fields.length === 0 && <p className={PROFILE_TEXT.empty}>{empty}</p>}
        {(atLimit || listError) && (
          <p className={`${PROFILE_TEXT.meta} ${listError ? "text-danger" : ""}`}>{listError ?? `You can add up to ${max}`}</p>
        )}
      </div>
    </ProfileSection>
  );
}
