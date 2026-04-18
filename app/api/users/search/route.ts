import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const res = await beClient(`/users/search?q=${encodeURIComponent(q)}`, {}, session.user.id);
  return NextResponse.json(await res.json());
}
