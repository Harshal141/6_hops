import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;
  const res = await beClient(`/profile/${userId}`, {}, session.user.id);

  if (!res.ok) {
    // Profile row might not exist — try fetching just the user
    const userRes = await beClient(`/users/${userId}`, {}, session.user.id);
    if (!userRes.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const user = await userRes.json();
    return NextResponse.json({ ...user, links: [], experience: [], education: [], skills: [] });
  }

  return NextResponse.json(await res.json());
}
