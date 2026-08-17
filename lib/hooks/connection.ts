import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody, ApiError } from "@/lib/utils/api";

export { ApiError };

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
  /** Handle, not a UUID (e.g. "priya-sharma-411898") */
  other_user_id: string;
  other_icon: string | null;
  other_title: string | null;
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

/**
 * A pending request in either direction. `direction` says which way it points;
 * `requester_id` / `addressee_id` are retained because relationship status is
 * derived from them.
 */
export interface ConnectionRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  requester_note: string;
  created_at: string;
  direction: "incoming" | "outgoing";
  other_id: string;
  other_name: string;
  other_handle: string;
  other_icon: string | null;
  other_title: string | null;
}

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

// ── Query keys ─────────────────────────────────────────────

const CONNECTIONS_KEY = ["connections"] as const;
const REQUESTS_KEY = ["connection-requests"] as const;
const REACHABLE_KEY = ["reachable"] as const;
const PATH_KEY = ["connection-path"] as const;
// search results carry is_connected / pending_direction, so any lifecycle change
// makes them stale
const SEARCH_KEY = ["user-search"] as const;

/**
 * Every mutation below changes the graph, and every one of these caches describes
 * some view of the graph. Invalidating them as a set is why there is no
 * per-mutation list: partial invalidation is what left disconnected people
 * showing as "connected" in search and stale chains on the path page.
 */
function useGraphInvalidation() {
  const qc = useQueryClient();
  return () => {
    for (const key of [CONNECTIONS_KEY, REQUESTS_KEY, REACHABLE_KEY, PATH_KEY, SEARCH_KEY]) {
      qc.invalidateQueries({ queryKey: key });
    }
  };
}

/** Traversal depth the UI asks for. The BE clamps anything above 6. */
export const DEFAULT_MAX_HOPS = 3;

// ── Queries ────────────────────────────────────────────────

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: [...SEARCH_KEY, query],
    queryFn: () => apiFetch<SearchUser[]>(`/api/users/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  });
}

export function useConnections() {
  return useQuery({
    queryKey: CONNECTIONS_KEY,
    queryFn: () => apiFetch<Connection[]>("/api/connection/list"),
  });
}

/** Both directions in one query — one cache, so nothing can diverge. */
export function useConnectionRequests() {
  return useQuery({
    queryKey: REQUESTS_KEY,
    queryFn: () => apiFetch<ConnectionRequest[]>("/api/connection/requests"),
  });
}

export function useReachable(maxHops: number = DEFAULT_MAX_HOPS) {
  return useQuery({
    queryKey: [...REACHABLE_KEY, maxHops],
    queryFn: () =>
      apiFetch<ReachablePerson[]>(`/api/connection/reachable?maxHops=${maxHops}`),
  });
}

export function usePathTo(targetId: string) {
  return useQuery({
    queryKey: [...PATH_KEY, targetId],
    queryFn: () => apiFetch<ConnectionPath>(`/api/connection/path/${targetId}`),
    enabled: targetId.length > 0,
  });
}

// ── Relationship with one person ───────────────────────────

export type ConnectionStatus = "connected" | "outgoing" | "incoming" | "none";

/**
 * Derives your relationship with someone from caches that are already loaded, so
 * no extra request is needed. "outgoing" means you asked them; "incoming" means
 * they asked you, in which case sending a request back would be rejected.
 */
export function useConnectionStatus(userId: string): ConnectionStatus {
  const { data: connections } = useConnections();
  const { data: requests } = useConnectionRequests();

  if (connections?.some((c) => c.user_a_id === userId || c.user_b_id === userId)) {
    return "connected";
  }

  const request = requests?.find(
    (r) => r.requester_id === userId || r.addressee_id === userId,
  );
  if (request) return request.direction;

  return "none";
}

// ── Mutations ──────────────────────────────────────────────

export function useSendRequest() {
  const invalidate = useGraphInvalidation();
  return useMutation({
    mutationFn: (data: { addresseeId: string; note: string }) =>
      apiFetch("/api/connection/request", { method: "POST", ...jsonBody(data) }),
    onSuccess: invalidate,
  });
}

export function useAcceptRequest() {
  const invalidate = useGraphInvalidation();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiFetch(`/api/connection/request/${id}/accept`, { method: "PUT", ...jsonBody({ note }) }),
    onSuccess: invalidate,
  });
}

export function useDeclineRequest() {
  const invalidate = useGraphInvalidation();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/connection/request/${id}/decline`, { method: "PUT" }),
    onSuccess: invalidate,
  });
}

export function useWithdrawRequest() {
  const invalidate = useGraphInvalidation();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/connection/request/${id}/withdraw`, { method: "PUT" }),
    onSuccess: invalidate,
  });
}

export function useDisconnect() {
  const invalidate = useGraphInvalidation();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/connection/${id}/disconnect`, { method: "PUT" }),
    onSuccess: invalidate,
  });
}
