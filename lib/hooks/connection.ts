import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────

export interface SearchUser {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  title: string | null;
  /** Already a 1st-degree connection */
  is_connected: boolean;
  /** Pending request between you two, and who sent it — null if none */
  pending_direction: "outgoing" | "incoming" | null;
}

export interface Connection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  note_by_a: string;
  note_by_b: string;
  status: string;
  connected_at: string;
  /** UUID of the other party — use this for profile links */
  other_id: string;
  other_name: string;
  /** Handle, not a UUID (e.g. "priya-sharma-demo") */
  other_user_id: string;
  other_icon: string | null;
}

/** Someone reachable through your network, but not directly connected to you. */
export interface ReachablePerson {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  title: string | null;
  /** Shortest number of hops from you — always >= 2 */
  hops: number;
  /** Your 1st-degree connection that starts the shortest path */
  via_id: string;
  via_name: string;
}

export interface ConnectionRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  requester_note: string;
  created_at: string;
  name: string;
  user_id: string;
  icon: string | null;
}

// ── Helpers ────────────────────────────────────────────────

const CONNECTIONS_KEY = ["connections"] as const;
const PENDING_KEY = ["connection-pending"] as const;
const SENT_KEY = ["connection-sent"] as const;
const REACHABLE_KEY = ["reachable"] as const;
// search results carry is_connected / pending_direction, so any lifecycle change
// makes them stale
const SEARCH_KEY = ["user-search"] as const;

/** Carries the HTTP status so callers can tell 404 from 503. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, `${res.status} — ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const json = (body: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// ── User Search ────────────────────────────────────────────

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: [...SEARCH_KEY, query],
    queryFn: () => apiFetch<SearchUser[]>(`/api/users/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  });
}

// ── Connections ────────────────────────────────────────────

export function useConnections() {
  return useQuery({
    queryKey: CONNECTIONS_KEY,
    queryFn: () => apiFetch<Connection[]>("/api/connection/list"),
  });
}

// ── Reachable (indirect, N-degree) ─────────────────────────

/** Traversal depth the UI asks for. The BE clamps anything above 6. */
export const DEFAULT_MAX_HOPS = 3;

export function useReachable(maxHops: number = DEFAULT_MAX_HOPS) {
  return useQuery({
    queryKey: [...REACHABLE_KEY, maxHops],
    queryFn: () =>
      apiFetch<ReachablePerson[]>(`/api/connection/reachable?maxHops=${maxHops}`),
  });
}

// ── Shortest path to one person ────────────────────────────

export interface PathPerson {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  title: string | null;
}

export interface ConnectionPath {
  hops: number;
  /** Ordered chain — [0] is always you, the last element is the target */
  path: PathPerson[];
}

export function usePathTo(targetId: string) {
  return useQuery({
    queryKey: ["connection-path", targetId],
    queryFn: () => apiFetch<ConnectionPath>(`/api/connection/path/${targetId}`),
    enabled: targetId.length > 0,
  });
}

// ── Relationship with one person ───────────────────────────

export type ConnectionStatus = "connected" | "outgoing" | "incoming" | "none";

/**
 * Derives your relationship with someone from the lists already in the cache,
 * so no extra request is needed. "outgoing" means you asked them; "incoming"
 * means they asked you (in which case sending a request back would be rejected).
 */
export function useConnectionStatus(userId: string): ConnectionStatus {
  const { data: connections } = useConnections();
  const { data: sent } = useSentRequests();
  const { data: pending } = usePendingRequests();

  if (connections?.some((c) => c.user_a_id === userId || c.user_b_id === userId)) {
    return "connected";
  }
  if (sent?.some((r) => r.addressee_id === userId)) return "outgoing";
  if (pending?.some((r) => r.requester_id === userId)) return "incoming";
  return "none";
}

// ── Pending Requests (incoming) ────────────────────────────

export function usePendingRequests() {
  return useQuery({
    queryKey: PENDING_KEY,
    queryFn: () => apiFetch<ConnectionRequest[]>("/api/connection/request/pending"),
  });
}

// ── Sent Requests (outgoing) ──────────────────────────────

export function useSentRequests() {
  return useQuery({
    queryKey: SENT_KEY,
    queryFn: () => apiFetch<ConnectionRequest[]>("/api/connection/request/sent"),
  });
}

// ── Send Request ──────────────────────────────────────────

export function useSendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { addresseeId: string; note: string }) =>
      apiFetch("/api/connection/request", { method: "POST", ...json(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SENT_KEY });
      qc.invalidateQueries({ queryKey: SEARCH_KEY });
    },
  });
}

// ── Accept Request ────────────────────────────────────────

export function useAcceptRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiFetch(`/api/connection/request/${id}/accept`, { method: "PUT", ...json({ note }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PENDING_KEY });
      qc.invalidateQueries({ queryKey: CONNECTIONS_KEY });
      // a new 1st-degree connection reshapes the whole traversal
      qc.invalidateQueries({ queryKey: REACHABLE_KEY });
      qc.invalidateQueries({ queryKey: SEARCH_KEY });
    },
  });
}

// ── Decline Request ───────────────────────────────────────

export function useDeclineRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/connection/request/${id}/decline`, { method: "PUT" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PENDING_KEY });
      qc.invalidateQueries({ queryKey: SEARCH_KEY });
    },
  });
}

// ── Withdraw Request ──────────────────────────────────────

export function useWithdrawRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/connection/request/${id}/withdraw`, { method: "PUT" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SENT_KEY });
      qc.invalidateQueries({ queryKey: SEARCH_KEY });
    },
  });
}

// ── Disconnect ────────────────────────────────────────────

export function useDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/connection/${id}/disconnect`, { method: "PUT" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONNECTIONS_KEY });
      qc.invalidateQueries({ queryKey: REACHABLE_KEY });
    },
  });
}
