import { NextResponse } from "next/server";
import { connections, indirectConnections } from "./data";

export async function GET() {
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
