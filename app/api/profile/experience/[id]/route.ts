import { proxyAuthed, jsonInit } from "@/lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  return proxyAuthed(`/profile/experience/${encodeURIComponent(id)}`, jsonInit("PUT", await request.json()));
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  return proxyAuthed(`/profile/experience/${encodeURIComponent(id)}`, { method: "DELETE" });
}
