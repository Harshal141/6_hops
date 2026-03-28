import { NextResponse } from "next/server";
import { beClient } from "@/lib/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);

  const res = await beClient(`/skill/search?q=${encodeURIComponent(q)}`);
  return NextResponse.json(await res.json());
}
