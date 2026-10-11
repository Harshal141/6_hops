import { put } from "@vercel/blob";

/**
 * Deterministic blob path per provider account, so re-uploads overwrite instead of
 * accumulating. Hashed because blob URLs are public.
 *
 * Keyed on the provider identity, not the email: the mirror runs before the BE has accepted
 * the sign-in, and an email key (written with overwrite) let any provider account that merely
 * *claimed* someone's email replace that person's avatar, even when the sign-in was then
 * refused. A caller can only ever write the blob of their own provider account.
 * prds/google-oauth-identity-linking.md §5.4.
 *
 * Uses Web Crypto, not `node:crypto`: `auth.ts` imports this module and
 * `middleware.ts` wraps `auth()`, so this file is bundled into the Edge
 * Runtime, where Node built-ins are unavailable.
 */
export async function avatarBlobKey(provider: string, subject: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${provider}:${subject}`));
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `avatars/${hex}.jpg`;
}

/**
 * Copies a provider's avatar into Blob storage, so the app never depends on the provider's
 * CDN URL (LinkedIn's are signed and expire, via the media.licdn.com `e=` param).
 * `allowedHosts` comes from the provider's adapter, because the source URL arrives in
 * caller-influenced claims. Returns null if the host isn't allowed or the copy fails.
 */
export async function mirrorAvatarToBlob(sourceUrl: string, key: string, allowedHosts: RegExp): Promise<string | null> {
  try {
    const { protocol, hostname } = new URL(sourceUrl);
    if (protocol !== "https:" || !allowedHosts.test(hostname)) return null;

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
