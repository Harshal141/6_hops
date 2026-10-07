import { proxyAuthed, jsonInit } from "@/lib/proxy";

export async function POST(request: Request) {
  return proxyAuthed("/profile/skill", jsonInit("POST", await request.json()));
}
