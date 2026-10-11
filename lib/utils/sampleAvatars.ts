/**
 * Faces for made-up people (the landing page's sample network and demos).
 * Static files in public/sample-faces/, written by
 * scripts/generate-sample-faces.mjs: nobody real is ever shown.
 */

/** How many distinct faces exist; a crowd reuses them. Matches the generator's COUNT. */
export const SAMPLE_FACE_COUNT = 24;

/** URL of sample face `index`, wrapping past the count. Same index, same face. */
export function sampleFaceUrl(index: number): string {
  const face = ((Math.floor(index) % SAMPLE_FACE_COUNT) + SAMPLE_FACE_COUNT) % SAMPLE_FACE_COUNT;
  return `/sample-faces/${face}.svg`;
}
