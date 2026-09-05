import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody, ApiError } from "@/lib/utils/api";
import { useProfile } from "./profile";

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

/** The deepest degree of separation the BE will compute a path for. */
export const MAX_HOPS_CEILING = 6;

/**
 * Below this many hops, the path view has nothing useful to add — a direct
 * connection needs no introduction chain, so send them straight to the
 * profile instead. This is the "how many degrees of separation do we cater
 * for" flag: raise it as the path/reachable UI is extended to deeper chains.
 */
export const MIN_HOPS_FOR_PATH_VIEW = 2;

/** Whether `hops` should route to the connection path view instead of straight to the profile. */
export function needsPathView(hops: number | null): boolean {
  return hops !== null && hops >= MIN_HOPS_FOR_PATH_VIEW;
}

/** `/connection/[id]` when the path view applies, `/profile/[id]` otherwise. */
export function profileDestination(id: string, hops: number | null): string {
  return needsPathView(hops) ? `/connection/${id}` : `/profile/${id}`;
}

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

// ── Ego network (connections graph) ───────────────────────────

/** A person in the 2-degree connections graph: you, a direct connection, or a friend of a friend. */
export interface EgoNetworkPerson {
  /** Internal id — used only for graph node identity/edge matching, never in a URL. */
  id: string;
  name: string;
  title: string | null;
  icon: string | null;
  /** 0 = you, 1 = direct connection, 2 = friend of a friend */
  degree: 0 | 1 | 2;
  /** id of the 1st-degree connection this person is reachable through (degree 2 only) */
  viaId: string | null;
  /** Public slug for `/profile/[handle]` — null only for "you". */
  handle: string | null;
}

export interface EgoNetworkEdge {
  source: string;
  target: string;
}

export interface EgoNetwork {
  people: EgoNetworkPerson[];
  edges: EgoNetworkEdge[];
}

const EGO_ID = "me";

/**
 * Your 2-degree network: you, your direct connections, and their direct
 * connections — grouped by which of your friends reaches each one, for the
 * connections graph. Composes three existing queries rather than adding a
 * new endpoint; each stays independently cached.
 */
export function useEgoNetwork() {
  const profile = useProfile();
  const connections = useConnections();
  const reachable = useReachable(2);

  const data = useMemo<EgoNetwork | null>(() => {
    if (!profile.data || !connections.data || !reachable.data) return null;

    const me: EgoNetworkPerson = {
      id: EGO_ID,
      name: profile.data.name,
      title: profile.data.title || null,
      icon: profile.data.icon || null,
      degree: 0,
      viaId: null,
      handle: null,
    };

    const firstDegree: EgoNetworkPerson[] = connections.data.map((c) => ({
      id: c.other_id,
      name: c.other_name,
      title: c.other_title,
      icon: c.other_icon,
      degree: 1,
      viaId: null,
      handle: c.other_user_id,
    }));
    const firstDegreeIds = new Set(firstDegree.map((p) => p.id));

    // `via_id` can point at a friend not currently in `connections` (a stale
    // cache mid-mutation) — drop those rather than render a dangling edge
    const secondDegree: EgoNetworkPerson[] = reachable.data
      .filter((p) => p.hops === 2 && firstDegreeIds.has(p.via_id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        title: p.title,
        icon: p.icon,
        degree: 2,
        viaId: p.via_id,
        handle: p.user_id,
      }));

    const edges: EgoNetworkEdge[] = [
      ...firstDegree.map((p) => ({ source: EGO_ID, target: p.id })),
      ...secondDegree.map((p) => ({ source: p.viaId as string, target: p.id })),
    ];

    return { people: [me, ...firstDegree, ...secondDegree], edges };
  }, [profile.data, connections.data, reachable.data]);

  return {
    data,
    isLoading: profile.isLoading || connections.isLoading || reachable.isLoading,
    isError: profile.isError || connections.isError || reachable.isError,
    error: profile.error ?? connections.error ?? reachable.error,
  };
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

/**
 * Hop count to someone, derived from already-loaded graph caches — 1 for a
 * direct connection, the BFS distance for anyone in the full reachable
 * window, or null when neither cache places them (no path within
 * `MAX_HOPS_CEILING`, or they simply haven't loaded yet).
 */
export function useHopsTo(userId: string): number | null {
  const { data: connections } = useConnections();
  const { data: reachable } = useReachable(MAX_HOPS_CEILING);

  if (connections?.some((c) => c.user_a_id === userId || c.user_b_id === userId)) {
    return 1;
  }
  return reachable?.find((p) => p.id === userId)?.hops ?? null;
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
