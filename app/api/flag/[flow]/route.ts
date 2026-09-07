import { NextRequest } from "next/server";
import { proxyAuthed, jsonInit } from "@/lib/proxy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ flow: string }> }) {
  const { flow } = await params;
  const body = await request.json();
  return proxyAuthed(`/flag/${encodeURIComponent(flow)}`, jsonInit("PATCH", body));
}
