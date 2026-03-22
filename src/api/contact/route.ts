import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, API_ENDPOINTS, CONTACT_FORM_MESSAGES } from "@/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.CONTACT}`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, subject, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Backend API failed");
    }

    return NextResponse.json({ success: true, message: data.message });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact API Proxy Error:", message);
    return NextResponse.json(
      { error: CONTACT_FORM_MESSAGES.ERROR },
      { status: 500 }
    );
  }
}