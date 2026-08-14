import { proxyAuthed } from "@/lib/proxy";

export async function GET() {
  return proxyAuthed("/connection/request/pending");
}
