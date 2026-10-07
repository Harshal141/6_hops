import { proxyAuthed } from "@/lib/proxy";

export async function DELETE(_request: Request, { params }: { params: Promise<{ skillId: string }> }) {
  const { skillId } = await params;
  return proxyAuthed(`/profile/skill/${encodeURIComponent(skillId)}`, { method: "DELETE" });
}
