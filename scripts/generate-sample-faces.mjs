// Writes the made-up faces used by the landing page's sample network and demos to
// public/sample-faces/. Run once (and again only if the set should change):
//
//   node scripts/generate-sample-faces.mjs
//
// DiceBear "notionists" (artwork CC0, code MIT): black-and-white sketched people that sit in
// the app's monochrome look. Pre-generated rather than built in the browser, so visitors
// download 24 small cached files instead of the generator, and nobody real is ever shown.
// The count must match SAMPLE_FACE_COUNT in lib/utils/sampleAvatars.ts.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAvatar } from "@dicebear/core";
import * as notionists from "@dicebear/notionists";

const COUNT = 24;
// light neutral backdrops (neutral-50..300), so faces vary a little in tone
const BACKGROUNDS = ["f5f5f5", "e5e5e5", "d4d4d4", "fafafa"];

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sample-faces");
mkdirSync(outDir, { recursive: true });

for (let i = 0; i < COUNT; i++) {
  const svg = createAvatar(notionists, {
    seed: `6hops-sample-${i}`,
    backgroundColor: [BACKGROUNDS[i % BACKGROUNDS.length]],
    size: 128,
  }).toString();
  writeFileSync(join(outDir, `${i}.svg`), svg);
}
console.log(`[sample-faces] wrote ${COUNT} faces to ${outDir}`);
