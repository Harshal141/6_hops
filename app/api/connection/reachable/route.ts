import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const maxHops = request.nextUrl.searchParams.get("maxHops") ?? "3";
  return proxyAuthed(`/connection/reachable?maxHops=${encodeURIComponent(maxHops)}`);
}
