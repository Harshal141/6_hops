"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./Button";

type Props = Omit<ButtonProps, "type" | "loading" | "href">;

/** Submit button for a `<form action={serverAction}>` — shows the shared `Button`'s
 * loading state (and blocks re-submits) for as long as the form's action is pending. */
export function FormSubmitButton({ disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} disabled={disabled} {...props} />;
}
