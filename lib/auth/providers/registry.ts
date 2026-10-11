import { google } from "./google";
import { linkedin } from "./linkedin";
import type { AuthProviderAdapter, ProviderId } from "./types";

// The one list of sign-in providers. Adding one: an adapter file, a line here, an entry in
// app/components/auth/providerUi.ts, and the BE's PROVIDERS allowlist (routes/auth.js). The
// Record types make a missing entry a compile error.
const ADAPTERS: Record<ProviderId, AuthProviderAdapter> = { linkedin, google };

/** Display order on the login page. Fixed: "Last used" adds a badge, it never reorders. */
const ORDER: readonly ProviderId[] = ["linkedin", "google"];

export const isProviderId = (value: unknown): value is ProviderId =>
  typeof value === "string" && Object.hasOwn(ADAPTERS, value);

export const adapterFor = (id: ProviderId): AuthProviderAdapter => ADAPTERS[id];

/**
 * Providers with credentials set, in display order. A provider without its env vars simply
 * doesn't exist for the app, which doubles as its kill switch.
 */
export const enabledAdapters = (env: Record<string, string | undefined> = process.env): AuthProviderAdapter[] =>
  ORDER.map((id) => ADAPTERS[id]).filter((adapter) => adapter.isConfigured(env));
