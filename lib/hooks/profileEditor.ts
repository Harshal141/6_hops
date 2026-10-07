import { useState } from "react";
import {
  useController, useForm, useFormContext, useWatch,
  type FieldError, type FieldPath, type PathValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/utils/api";
import { buildProfilePatch, toProfileForm } from "@/lib/utils/profilePatch";
import {
  profileFormSchema,
  type EducationFormValues, type ExperienceFormValues,
  type ProfileFormOutput, type ProfileFormValues,
} from "@/lib/schemas/profile";
import { useSaveProfile, type Profile, type SectionConfig } from "./profile";

// ── Editor: edit mode, the form, and the one save ──────────

interface EditorCallbacks {
  onSaved: () => void;
  onError: (message: string) => void;
}

function saveErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "Couldn't save your changes. Try again.";
  if (err.status === 409) return "Your profile changed somewhere else. Cancel and edit again to load it.";
  if (err.isBackendUnavailable) return "Couldn't reach the server. Try again.";
  return err.message;
}

/**
 * The profile editor's state. Saving sends only what changed, in one all-or-nothing request,
 * so a failed save leaves nothing half-written and can simply be retried.
 */
export function useProfileEditor(profile: Profile | undefined, { onSaved, onError }: EditorCallbacks) {
  const form = useForm<ProfileFormValues, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileFormSchema),
  });
  const save = useSaveProfile();
  const reorder = useSaveProfile();

  // What editing started from, and the version it was read at. The version is captured here,
  // not read from the cache at save time: a background refetch would otherwise pick up another
  // tab's save and let this one silently overwrite it.
  const [session, setSession] = useState<{ initial: ProfileFormValues; version: string | null } | null>(null);

  const start = () => {
    if (!profile) return;
    const initial = toProfileForm(profile);
    form.reset(initial);
    setSession({ initial, version: profile.updated_at });
  };

  const stop = () => setSession(null);

  const submit = form.handleSubmit(async (values) => {
    if (!session) return;
    const patch = buildProfilePatch(session.initial, values, session.version);
    if (!patch) return stop();
    try {
      await save.mutateAsync(patch);
      stop();
      onSaved();
    } catch (err) {
      const message = saveErrorMessage(err);
      form.setError("root", { message });
      onError(message);
    }
  });

  // Section order saves on drop. It moves this tab's version forward, so the form's own save
  // isn't refused as stale for a change this tab made.
  const changeOrder = (section_config: SectionConfig[]) =>
    reorder.mutate({ section_config }, {
      onSuccess: (data) => setSession((s) => s && { ...s, version: (data.updated_at as string) ?? s.version }),
      onError: (err) => onError(saveErrorMessage(err)),
    });

  return {
    form,
    isEditing: session !== null,
    isSaving: save.isPending,
    start,
    stop,
    submit,
    changeOrder,
  };
}

// ── Field adapters for the ui primitives (value / onChange / error) ──

/** One field of the editor form, shaped for Input / Textarea / Select. Must be inside its FormProvider. */
export function useProfileField<N extends FieldPath<ProfileFormValues>>(name: N) {
  const { field, fieldState } = useController<ProfileFormValues, N>({ name });
  return { value: field.value, onChange: field.onChange, error: fieldState.error?.message };
}

interface RowValues {
  experience: ExperienceFormValues;
  education: EducationFormValues;
}

/**
 * One experience or education row, shaped for ExperienceFields / EducationFields, which take the
 * whole row and report changes field by field (they are shared with the resume-import review).
 */
export function useProfileRow<S extends keyof RowValues>(section: S, index: number) {
  const { control, setValue, formState } = useFormContext<ProfileFormValues>();
  const name = `${section}.${index}` as const;
  const value = useWatch({ control, name }) as RowValues[S];

  const rowErrors = (formState.errors[section]?.[index] ?? {}) as Partial<Record<keyof RowValues[S], FieldError>>;
  const errors = Object.fromEntries(
    Object.entries(rowErrors).flatMap(([field, error]) =>
      (error as FieldError | undefined)?.message ? [[field, (error as FieldError).message]] : []),
  ) as Partial<Record<keyof RowValues[S], string>>;

  const onChange = (field: keyof RowValues[S], next: unknown) =>
    // re-validate as the user types only once a submit has shown errors
    setValue(name, { ...value, [field]: next } as PathValue<ProfileFormValues, typeof name>, {
      shouldDirty: true,
      shouldValidate: formState.isSubmitted,
    });

  return { value, errors, onChange };
}
