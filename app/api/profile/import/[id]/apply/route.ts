import { proxyAuthed, jsonInit } from "@/lib/proxy";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAuthed(
    `/profile/import/${encodeURIComponent(id)}/apply`,
    jsonInit("POST", await request.json()),
  );
}
