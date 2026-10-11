"use server";

import { signIn } from "@/auth";
import { enabledAdapters, isProviderId } from "@/lib/auth/providers/registry";

/**
 * Starts the OAuth redirect for the button that was pressed; bound per button on the login
 * page. A server action is a public endpoint, so the arguments are re-checked: `provider` must
 * name an enabled provider, or nothing happens. `callbackUrl` needs no check here: the Auth.js
 * `redirect` callback (lib/auth/redirect.ts) only allows same-origin targets.
 */
export async function signInWithProvider(provider: unknown, callbackUrl: unknown): Promise<void> {
  if (!isProviderId(provider) || !enabledAdapters().some((adapter) => adapter.id === provider)) return;
  await signIn(provider, { redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard" });
}
