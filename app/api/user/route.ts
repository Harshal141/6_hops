import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { proxyAuthed, jsonInit } from "@/lib/proxy";

// The BE path needs the session's id, so the session is read here before proxying.

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return proxyAuthed(`/users/${session.user.id}`);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return proxyAuthed(`/users/${session.user.id}`, jsonInit("PUT", await request.json()));
}
