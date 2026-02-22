import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { connections, indirectConnections } from "./data";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    connections,
    indirectConnections,
    meta: {
      total: connections.length,
      starred: connections.filter((c) => c.isStarred).length,
      online: connections.filter((c) => c.isOnline).length,
      reachable: indirectConnections.length,
    },
  });
}
