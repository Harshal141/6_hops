import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  return proxyAuthed(`/users/search?q=${encodeURIComponent(q)}`);
}
