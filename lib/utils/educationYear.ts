/** The stored shapes: `YYYY`, `YYYY-YYYY`, or `YYYY-` (still studying). Mirrors the BE's year check. */
const EDUCATION_YEAR = /^\d{4}(-(\d{4})?)?$/;

/** Blank (no year) or one of the stored shapes. */
export const isValidEducationYear = (year: string) => !year.trim() || EDUCATION_YEAR.test(year.trim());

/** "2021-2024" → { start: "2021", end: "2024", current: false }; "2021-" is still studying. */
export function parseYear(year: string): { start: string; end: string; current: boolean } {
  if (!year) return { start: "", end: "", current: false };
  if (year.includes("-")) {
    const [start, end] = year.split("-");
    return { start: start ?? "", end: end ?? "", current: end === "" };
  }
  return { start: year, end: "", current: false };
}

export function combineYear(start: string, end: string, current: boolean): string {
  if (!start) return "";
  if (current) return `${start}-`;
  if (end) return `${start}-${end}`;
  return start;
}

export function displayYear(year: string): string {
  const { start, end, current } = parseYear(year);
  if (!start) return "";
  if (current) return `${start} – present`;
  if (end) return `${start} – ${end}`;
  return start;
}
