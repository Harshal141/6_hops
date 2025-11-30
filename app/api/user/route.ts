import { NextResponse } from "next/server";
import { currentUser, User } from "./data";

// In-memory store (resets on server restart)
let userData: User = { ...currentUser };

export async function GET() {
  return NextResponse.json(userData);
}

export async function PUT(request: Request) {
  try {
    const updatedUser: User = await request.json();
    userData = { ...userData, ...updatedUser };
    return NextResponse.json(userData);
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
