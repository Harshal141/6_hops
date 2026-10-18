import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { needsOnboarding } from "@/lib/onboardingGate";

/**
 * Never rendered — a pure pass-through. The referral write already happened in
 * auth.ts's `jwt` callback (new signups) or was a no-op (existing users); by
 * the time a logged-in request reaches this route there is nothing left to do
 * but land on the actual profile. See prds/referral-signin-redirect.md Part 2.
 *
 * A brand-new signup goes through setup first instead; the referrer is waiting for them
 * at the top of its Connect step.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();
  if (await needsOnboarding(session?.user.id)) redirect("/onboarding");
  redirect(`/profile/${userId}`);
}
