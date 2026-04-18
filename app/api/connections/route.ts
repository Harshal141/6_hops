import { NextResponse } from "next/server";
import { indirectConnections } from "./data";

// This route now only serves mock indirect/reachable connections.
// Direct connections are served via /api/connection/list (real BE data).
export async function GET() {
  return NextResponse.json({
    indirectConnections,
    meta: {
      reachable: indirectConnections.length,
    },
  });
}
