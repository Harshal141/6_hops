import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const res = await beClient(`/connection/request/${id}/decline`, {
    method: "PUT",
  }, session.user.id);

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
