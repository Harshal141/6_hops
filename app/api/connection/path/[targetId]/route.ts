import { proxyAuthed } from "@/lib/proxy";

export async function GET(_request: Request, { params }: { params: Promise<{ targetId: string }> }) {
  const { targetId } = await params;
  return proxyAuthed(`/connection/path/${encodeURIComponent(targetId)}`);
}
