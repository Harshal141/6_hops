import { NextResponse } from "next/server";
import { currentUser } from "./data";

export async function GET() {
  return NextResponse.json(currentUser);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ ...currentUser, ...body });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
