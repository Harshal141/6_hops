import { proxyAuthed } from "@/lib/proxy";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return proxyAuthed(`/skill/search?q=${encodeURIComponent(q.trim())}`);
}
