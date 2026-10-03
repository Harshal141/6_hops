import { proxyAuthed, jsonInit } from "@/lib/proxy";

export async function POST(request: Request) {
  return proxyAuthed("/profile/experience", jsonInit("POST", await request.json()));
}
