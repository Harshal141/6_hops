import { redirect } from "next/navigation";

/**
 * Never rendered — a pure pass-through. The referral write already happened in
 * auth.ts's `jwt` callback (new signups) or was a no-op (existing users); by
 * the time a logged-in request reaches this route there is nothing left to do
 * but land on the actual profile. See prds/referral-signin-redirect.md Part 2.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  redirect(`/profile/${userId}`);
}
