import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";
import { proxyAuthed, jsonInit, forwardResponse } from "@/lib/proxy";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await beClient(`/profile/${session.user.id}`, {});

  if (res.status === 404) {
    // No profile row yet — return user data as a skeleton so the page can render
    const userRes = await beClient(`/users/${session.user.id}`, {});
    if (!userRes.ok) return forwardResponse(userRes);
    const user = await userRes.json();
    return NextResponse.json({ ...user, links: [], experience: [], education: [], skills: [] });
  }

  return forwardResponse(res);
}

// The editor's one save: every change in one atomic request. See ProfilePatch for the body.
export async function PATCH(request: Request) {
  return proxyAuthed("/profile", jsonInit("PATCH", await request.json()));
}
