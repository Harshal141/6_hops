import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await beClient("/connection/request/sent", {}, session.user.id);
  return NextResponse.json(await res.json());
}
