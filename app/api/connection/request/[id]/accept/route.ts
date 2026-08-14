import { NextRequest } from "next/server";
import { proxyAuthed, jsonInit } from "@/lib/proxy";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return proxyAuthed(
    `/connection/request/${encodeURIComponent(id)}/accept`,
    jsonInit("PUT", body),
  );
}
