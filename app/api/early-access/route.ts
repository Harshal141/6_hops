import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://service-hops.vercel.app/api/early-access";

interface EarlyAccessRequest {
  email: string;
  curiosityReason: string;
  useCase: string | null;
  canEmailForFeedback: boolean;
  submittedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EarlyAccessRequest = await request.json();

    // Log the request body (for development)
    console.log("Early Access Request Body:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!body.curiosityReason) {
      return NextResponse.json(
        { error: "Curiosity reason is required" },
        { status: 400 }
      );
    }

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error("Backend request failed");
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Early access submission error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
