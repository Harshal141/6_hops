import { z } from "zod";
import { isValidEducationYear } from "@/lib/utils/educationYear";

// Mirror of service_hops/utils/profileFields.js (FIELD_LIMITS, LINK_TYPES, MAX_ITEMS). The BE is
// the authority and rejects the same input; this copy exists so the form can say so before a
// request is made. Change both together.

export const PROFILE_LIMITS = { links: 10, experience: 15, education: 10 } as const;

const FIELD_MAX = {
  name: 200, title: 500, bio: 5000, location: 200,
  company: 200, role: 200, description: 5000,
  institution: 200, degree: 200, url: 2048,
} as const;

export const LINK_TYPES = ["linkedin", "github", "twitter", "portfolio", "other"] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  twitter: "Twitter",
  portfolio: "Portfolio",
  other: "Other",
};

/** A stored type as one the form accepts. Links saved before the allowlist may hold "Portfolio" or "website". */
export function toLinkType(type: string): LinkType {
  const lower = type.trim().toLowerCase();
  return (LINK_TYPES as readonly string[]).includes(lower) ? (lower as LinkType) : "other";
}

/** http(s) with a dotted host, the same check as the BE's parseHttpUrl. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

type TextField = keyof typeof FIELD_MAX;

const text = (field: TextField) =>
  z.string().trim().max(FIELD_MAX[field], `Keep this under ${FIELD_MAX[field]} characters`);
const required = (field: TextField, message: string) => text(field).min(1, message);

const rowId = z.number().int().positive().optional();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date").nullable();

export const linkSchema = z.object({
  id: rowId,
  type: z.enum(LINK_TYPES),
  url: text("url").refine(isHttpUrl, "Use a full link starting with https://"),
});

export const experienceSchema = z
  .object({
    id: rowId,
    company: required("company", "Add a company"),
    role: required("role", "Add a role"),
    started_at: isoDate,
    ended_at: isoDate,
    currently_working: z.boolean(),
    description: text("description"),
  })
  .refine(
    (e) => e.currently_working || !e.started_at || !e.ended_at || e.ended_at >= e.started_at,
    { message: "End date is before the start date", path: ["ended_at"] },
  );

export const educationSchema = z.object({
  id: rowId,
  institution: required("institution", "Add a school"),
  degree: text("degree"),
  year: z.string().trim().refine(isValidEducationYear, "Use a year like 2020 or a range like 2018-2022"),
});

const limited = <T extends z.ZodType>(row: T, max: number, message: string) => z.array(row).max(max, message);

/** The profile editor's form. Skills and section order save on their own and are not in it. */
export const profileFormSchema = z.object({
  name: required("name", "Name cannot be empty"),
  title: text("title"),
  location: text("location"),
  bio: text("bio"),
  links: limited(linkSchema, PROFILE_LIMITS.links, `Up to ${PROFILE_LIMITS.links} links`),
  experience: limited(experienceSchema, PROFILE_LIMITS.experience, `Up to ${PROFILE_LIMITS.experience} roles`),
  education: limited(educationSchema, PROFILE_LIMITS.education, `Up to ${PROFILE_LIMITS.education} schools`),
});

/** What the fields hold while editing. */
export type ProfileFormValues = z.input<typeof profileFormSchema>;
/** What a valid submit yields: trimmed. */
export type ProfileFormOutput = z.output<typeof profileFormSchema>;
export type LinkFormValues = z.input<typeof linkSchema>;
export type ExperienceFormValues = z.input<typeof experienceSchema>;
export type EducationFormValues = z.input<typeof educationSchema>;
