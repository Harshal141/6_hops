import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingFlow } from "../components";
import { firstName, parseStepParam } from "@/lib/utils/onboarding";

export const metadata: Metadata = { title: "Get set up" };

/** New-user setup. Thin: the session and `?step=` in, the flow does the rest. */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { step } = await searchParams;
  return (
    <OnboardingFlow
      firstName={firstName(session.user.name)}
      name={session.user.name ?? ""}
      email={session.user.email ?? ""}
      requestedStep={parseStepParam(typeof step === "string" ? step : null)}
    />
  );
}
