import type { Experience } from "@/lib/hooks/profile";

/**
 * The year of a stored `YYYY-MM-DD` date, read from the string. `new Date("2020-01-01")` is UTC
 * midnight, so `getFullYear()` gives 2019 anywhere west of UTC — and year-precision resume imports
 * are all stored as `YYYY-01-01`.
 */
const yearOf = (date: string | null | undefined) => date?.slice(0, 4) ?? "";

/** "2020 – 2023", "2020 – present", "2020" with no end date, or "" with no start date. */
export function displayExperienceYears(
  exp: Pick<Experience, "started_at" | "ended_at" | "currently_working">,
): string {
  const start = yearOf(exp.started_at);
  if (!start) return "";
  const end = exp.currently_working ? "present" : yearOf(exp.ended_at);
  return end ? `${start} – ${end}` : start;
}
