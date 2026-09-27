import { describe, expect, it } from "vitest";
import { avatarBlobKey, mirrorAvatarToBlob } from "./avatar";

describe("avatarBlobKey", () => {
  it("is deterministic for the same email", async () => {
    expect(await avatarBlobKey("a@example.com")).toBe(await avatarBlobKey("a@example.com"));
  });

  it("differs per email", async () => {
    expect(await avatarBlobKey("a@example.com")).not.toBe(await avatarBlobKey("b@example.com"));
  });

  // The migrated users' blobs live at paths derived from the previous
  // `node:crypto` implementation — this pins the hash so switching to Web
  // Crypto keeps resolving to the same object instead of orphaning it.
  it("matches the sha256 path the existing stored avatars use", async () => {
    expect(await avatarBlobKey("harshalmukundapatil@gmail.com")).toBe(
      "avatars/a0c33fec0be487510d861aa9b2b80a1511e919a6a6650e66bf2903278f3ad8fd.jpg"
    );
  });
});

describe("mirrorAvatarToBlob", () => {
  it("refuses a non-licdn host without making a network call", async () => {
    const result = await mirrorAvatarToBlob("https://evil.example.com/x.jpg", "avatars/x.jpg");
    expect(result).toBeNull();
  });
});
