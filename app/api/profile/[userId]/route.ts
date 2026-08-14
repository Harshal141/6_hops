import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

// Not using proxyAuthed: this route needs a two-call fallback, since a user can
// exist without a profile row (demo users seeded by v8 start that way).
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;
  const id = encodeURIComponent(userId);

  try {
    const res = await beClient(`/profile/${id}`, {});
    if (res.ok) return NextResponse.json(await res.json());

    const userRes = await beClient(`/users/${id}`, {});
    if (!userRes.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await userRes.json();
    return NextResponse.json({
      ...user,
      links: [],
      experience: [],
      education: [],
      skills: [],
    });
  } catch {
    return NextResponse.json({ error: "backend_unavailable" }, { status: 503 });
  }
}
