import { put } from "@vercel/blob";
import { createHash } from "crypto";

const ALLOWED_HOSTS = /(^|\.)licdn\.com$/;

/** Deterministic blob path per user so re-uploads overwrite instead of accumulating. */
export function avatarBlobKey(email: string): string {
  return `avatars/${createHash("sha256").update(email).digest("hex")}.jpg`;
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
