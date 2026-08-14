import { NextRequest } from "next/server";
import { proxyAuthed, jsonInit } from "@/lib/proxy";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyAuthed("/connection/request", jsonInit("POST", body));
}
