import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/constants/contact";

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ ERROR: RESEND_API_KEY is missing from environment variables.");
    return NextResponse.json(
      { error: "Contact service is not configured (Missing API Key). Check your .env.local file." },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Send confirmation email to the customer
    const customerResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "We got your message!",
      html: `<p>Hi ${name}, we've received your message: "${subject}" and we'll get back to you within 24 hours.</p>`,
    });

    if (customerResponse.error) {
      console.error("Resend (Customer) Error:", customerResponse.error);
      return NextResponse.json(
        { error: `Error sending to customer: ${customerResponse.error.message}` },
        { status: 500 }
      );
    }

    // 2. Send notification email to the team
    const teamResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: CONTACT_EMAIL,
      subject: `New Lead: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (teamResponse.error) {
       console.error("Resend (Team) Error:", teamResponse.error);
       // We still return success if the customer got their mail, but we log the team error
    }

    return NextResponse.json({ success: true, data: customerResponse.data });
  } catch (error: any) {
    console.error("Unhandled API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
