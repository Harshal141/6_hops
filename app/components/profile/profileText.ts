/** One type scale for every profile section: item titles and body are 14px, section headings and meta 12px. */
export const PROFILE_TEXT = {
  sectionHeading: "font-mono font-semibold text-xs text-fg-muted",
  itemTitle: "font-mono font-semibold text-sm text-fg",
  itemSubtitle: "font-mono text-sm text-fg-muted",
  body: "font-mono text-sm text-fg-body leading-relaxed whitespace-pre-line",
  meta: "font-mono text-xs text-fg-subtle",
  empty: "font-mono text-sm text-fg-placeholder italic",
} as const;
