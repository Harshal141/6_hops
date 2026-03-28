import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

export async function DELETE(_request: Request, { params }: { params: Promise<{ skillId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { skillId } = await params;
  await beClient(`/profile/skill/${skillId}`, { method: "DELETE" }, session.user.id);
  return new NextResponse(null, { status: 204 });
}
