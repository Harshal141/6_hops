import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SITE } from "./siteMeta";

describe("SITE.accent", () => {
  it("matches the --color-accent token in globals.css", () => {
    const css = readFileSync(path.join(__dirname, "globals.css"), "utf8");
    const token = css.match(/--color-accent:\s*(#[0-9a-fA-F]{3,8})\s*;/)?.[1];
    expect(token?.toLowerCase()).toBe(SITE.accent.toLowerCase());
  });
});
