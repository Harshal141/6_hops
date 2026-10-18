import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api";
import type { ConnectionStatus } from "./connection";

// ── Types: the BE contract ─────────────────────────────────

/** Why someone is suggested: they invited this user, or they're well connected. */
export type SuggestionReason = "referrer" | "popular";
export type SuggestionRelation = "none" | "request_sent" | "request_received" | "connected";

export interface Suggestion {
  /** Internal id, for connection requests. */
  id: string;
  /** Public handle, for profile links. */
  user_id: string;
  name: string;
  icon: string | null;
  headline: string | null;
  connection_count: number;
  reason: SuggestionReason;
  relation: SuggestionRelation;
}

// ── Query keys ─────────────────────────────────────────────

/** Exported so connection mutations can invalidate it: a request changes who is suggested. */
export const SUGGESTIONS_KEY = ["onboarding-suggestions"] as const;

// ── Normalisation ──────────────────────────────────────────

const RELATIONS: readonly SuggestionRelation[] = ["none", "request_sent", "request_received", "connected"];

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

/** One row with every field defaulted, or null when it has no id to send a request to. */
export function normalizeSuggestion(raw: unknown): Suggestion | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = text(row.id);
  if (!id) return null;
  const count = Number(row.connection_count);
  return {
    id,
    user_id: text(row.user_id) ?? "",
    name: text(row.name) ?? "",
    icon: text(row.icon),
    headline: text(row.headline),
    connection_count: Number.isFinite(count) && count > 0 ? Math.trunc(count) : 0,
    reason: row.reason === "referrer" ? "referrer" : "popular",
    relation: RELATIONS.includes(row.relation as SuggestionRelation) ? (row.relation as SuggestionRelation) : "none",
  };
}

/**
 * The list as the UI uses it: malformed rows dropped, each person once (the referrer can
 * also be popular), and at most one referrer, always first.
 */
export function normalizeSuggestions(raw: unknown): Suggestion[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const rows: Suggestion[] = [];
  let hasReferrer = false;
  for (const item of raw) {
    const row = normalizeSuggestion(item);
    if (!row || seen.has(row.id)) continue;
    seen.add(row.id);
    if (row.reason === "referrer") {
      if (hasReferrer) row.reason = "popular";
      hasReferrer = true;
    }
    rows.push(row);
  }
  return rows.sort((a, b) => Number(b.reason === "referrer") - Number(a.reason === "referrer"));
}

/** The BE relation as the shared connection status, with a request sent this session counted as sent. */
export function suggestionStatus(relation: SuggestionRelation, sentThisSession: boolean): ConnectionStatus {
  if (relation === "connected") return "connected";
  if (sentThisSession || relation === "request_sent") return "outgoing";
  if (relation === "request_received") return "incoming";
  return "none";
}

/** Someone requested from the suggested list during this visit, and where they sat in it. */
export interface PinnedSuggestion {
  person: Suggestion;
  index: number;
}

/**
 * The suggested list as shown: the fresh list, with everyone requested this visit kept at the
 * place they were requested from. The BE drops anyone with a pending request from its popular
 * list, so without this a person would vanish the moment you connect with them, and the cards
 * around them would shift. At most `limit` people, unless more than that were requested.
 */
export function keepRequested(fresh: readonly Suggestion[], pinned: readonly PinnedSuggestion[], limit: number): Suggestion[] {
  const pinnedIds = new Set(pinned.map(({ person }) => person.id));
  const shown = fresh.filter((person) => !pinnedIds.has(person.id));
  for (const { person, index } of [...pinned].sort((a, b) => a.index - b.index)) {
    shown.splice(Math.min(Math.max(index, 0), shown.length), 0, person);
  }
  return shown.slice(0, Math.max(limit, pinned.length));
}

// ── Queries ────────────────────────────────────────────────

/** People to connect with first: whoever invited you, then the best connected. */
export function useSuggestions(limit = 3) {
  return useQuery({
    queryKey: [...SUGGESTIONS_KEY, limit],
    queryFn: async () =>
      normalizeSuggestions(await apiFetch<unknown>(`/api/onboarding/suggestions?limit=${limit}`)),
    staleTime: 60_000,
  });
}
