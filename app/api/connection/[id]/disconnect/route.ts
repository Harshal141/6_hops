import { proxyAuthed } from "@/lib/proxy";

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAuthed(`/connection/${encodeURIComponent(id)}/disconnect`, { method: "PUT" });
}
