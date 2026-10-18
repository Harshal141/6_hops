import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyAuthed(`/onboarding/suggestions${request.nextUrl.search}`);
}
