import { afterEach, describe, expect, it, vi } from "vitest";
import { avatarBlobKey, mirrorAvatarToBlob } from "./avatar";

describe("avatarBlobKey", () => {
  it("is deterministic for the same provider account", async () => {
    expect(await avatarBlobKey("google", "123")).toBe(await avatarBlobKey("google", "123"));
  });

  it("differs per provider and per subject", async () => {
    const key = await avatarBlobKey("google", "123");
    expect(await avatarBlobKey("linkedin", "123")).not.toBe(key);
    expect(await avatarBlobKey("google", "124")).not.toBe(key);
  });

  // Pins the identity-keyed path (sha256 of "provider:subject"), so a refactor can't silently
  // move every user's blob, and the key can't drift back to something derived from the email.
  it("is the sha256 of provider:subject", async () => {
    expect(await avatarBlobKey("google", "110169484474386276334")).toBe(
      "avatars/34ae178433d075ea445f338490c149c5b2cda90ea08f9a5e50123c3f581dc27e.jpg"
    );
  });
});

describe("mirrorAvatarToBlob", () => {
  const google = /(^|\.)googleusercontent\.com$/;

  // mirrorAvatarToBlob swallows every error and returns null, so a null result alone would
  // pass even with the allowlist removed (the fetch would just fail). The guarantee is that
  // no request is made at all.
  const fetchSpy = () => vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network call made"));
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ["a host outside the provider's allowlist", "https://evil.example.com/x.jpg"],
    ["another provider's host", "https://media.licdn.com/x.jpg"],
    ["a lookalike host", "https://lh3.googleusercontent.com.evil.example/x.jpg"],
    ["a non-https URL", "http://lh3.googleusercontent.com/a/x"],
  ])("refuses %s without making a network call", async (_label, url) => {
    const spy = fetchSpy();
    expect(await mirrorAvatarToBlob(url, "avatars/x.jpg", google)).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("does fetch an allowed host (so the refusals above are meaningful)", async () => {
    const spy = fetchSpy();
    expect(await mirrorAvatarToBlob("https://lh3.googleusercontent.com/a/x", "avatars/x.jpg", google)).toBeNull();
    expect(spy).toHaveBeenCalledOnce();
  });
});
