import { NextResponse } from "next/server";
import { currentUser } from "./data";

export async function GET() {
  return NextResponse.json(currentUser);
}
