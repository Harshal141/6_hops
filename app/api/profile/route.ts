import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await beClient(`/profile/${session.user.id}`, {}, session.user.id);

  if (res.status === 404) {
    // No profile row yet — return user data as a skeleton so the page can render
    const userRes = await beClient(`/users/${session.user.id}`, {}, session.user.id);
    if (!userRes.ok) return NextResponse.json(null);
    const user = await userRes.json();
    return NextResponse.json({ ...user, links: [], experience: [], education: [], skills: [] });
  }

  return NextResponse.json(await res.json());
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const res = await beClient("/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, session.user.id);
  return NextResponse.json(await res.json());
}
