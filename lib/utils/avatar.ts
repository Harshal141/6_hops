import { put } from "@vercel/blob";

const ALLOWED_HOSTS = /(^|\.)licdn\.com$/;

/**
 * Deterministic blob path per user so re-uploads overwrite instead of
 * accumulating. Hashed rather than the raw email because blob URLs are public.
 *
 * Uses Web Crypto, not `node:crypto`: `auth.ts` imports this module and
 * `middleware.ts` wraps `auth()`, so this file is bundled into the Edge
 * Runtime, where Node built-ins are unavailable.
 */
export async function avatarBlobKey(email: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `avatars/${hex}.jpg`;
}

/**
 * Copies a LinkedIn avatar into Blob storage so the app never depends on
 * LinkedIn's time-limited signed CDN URL (media.licdn.com `e=` expiry param).
 * Restricted to licdn.com hosts since the source URL can originate from
 * caller-supplied data.
 */
export async function mirrorAvatarToBlob(sourceUrl: string, key: string): Promise<string | null> {
  try {
    const { hostname } = new URL(sourceUrl);
    if (!ALLOWED_HOSTS.test(hostname)) return null;

    const res = await fetch(sourceUrl);
    if (!res.ok) return null;

    const bytes = await res.arrayBuffer();
    const blob = await put(key, Buffer.from(bytes), {
      access: "public",
      contentType: res.headers.get("content-type") ?? "image/jpeg",
      allowOverwrite: true,
    });
    return blob.url;
  } catch {
    return null;
  }
}
