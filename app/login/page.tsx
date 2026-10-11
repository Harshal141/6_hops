import { cookies } from "next/headers";
import { GridBackground, Navbar, Footer } from "../components";
import { ProviderButton, SignInError } from "../components/auth";
import { adapterFor, enabledAdapters, isProviderId } from "@/lib/auth/providers/registry";
import { readCallbackPath } from "@/lib/auth/callbackUrlCookie";
import { LAST_USED_COOKIE, parseLastUsed } from "@/lib/auth/lastUsedProvider";
import { signInErrorMessage } from "@/lib/auth/signInErrors";
import { signInWithProvider } from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;

// A repeated query param (`?error=a&error=b`) arrives as an array; only a single value counts.
const single = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const error = single(params.error);
  const provider = single(params.provider);
  // A refused or failed sign-in comes back to /login without `?callbackUrl=`. Restore the
  // destination from Auth.js's cookie so a retry still lands there (and an invite still
  // credits its referrer). Only after an error: on a fresh visit the cookie may be stale.
  const restored = error ? await readCallbackPath() : null;
  const callbackUrl = single(params.callbackUrl) ?? restored ?? undefined;

  const adapters = enabledAdapters();
  const lastUsed = parseLastUsed((await cookies()).get(LAST_USED_COOKIE)?.value, adapters.map((adapter) => adapter.id));
  const errorMessage = signInErrorMessage(
    error,
    isProviderId(provider) ? adapterFor(provider).label : null,
  );

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-xs flex flex-col items-center text-center">
          <h2 className="text-2xl font-mono font-bold text-neutral-800 mb-2">Sign in</h2>
          <p className="font-mono text-neutral-400 text-sm mb-10">Discover your professional network.</p>
          {errorMessage && (
            <div className="w-full mb-6">
              <SignInError message={errorMessage} />
            </div>
          )}
          <div className="w-full flex flex-col gap-5">
            {adapters.map((adapter) => (
              <ProviderButton
                key={adapter.id}
                provider={adapter.id}
                lastUsed={adapter.id === lastUsed}
                action={signInWithProvider.bind(null, adapter.id, callbackUrl ?? null)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
