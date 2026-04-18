import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────

export interface SearchUser {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  title: string | null;
}

export interface Connection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  note_by_a: string;
  note_by_b: string;
  status: string;
  connected_at: string;
  other_name: string;
  other_user_id: string;
  other_icon: string | null;
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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} — ${text}`);
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
    queryKey: ["user-search", query],
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
    },
  });
}
