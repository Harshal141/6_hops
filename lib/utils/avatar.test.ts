import { describe, expect, it } from "vitest";
import { avatarBlobKey, mirrorAvatarToBlob } from "./avatar";

describe("avatarBlobKey", () => {
  it("is deterministic for the same email", () => {
    expect(avatarBlobKey("a@example.com")).toBe(avatarBlobKey("a@example.com"));
  });

  it("differs per email", () => {
    expect(avatarBlobKey("a@example.com")).not.toBe(avatarBlobKey("b@example.com"));
  });
});

describe("mirrorAvatarToBlob", () => {
  it("refuses a non-licdn host without making a network call", async () => {
    const result = await mirrorAvatarToBlob("https://evil.example.com/x.jpg", "avatars/x.jpg");
    expect(result).toBeNull();
  });
});
