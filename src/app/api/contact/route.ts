import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email to YOU — the notification
    await transporter.sendMail({
      from: `"Plug and Play Agent" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // sends to yourself
      replyTo: email,            // reply goes to the user
      subject: `[Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #555;">Name</td>
              <td style="padding: 8px;">${name}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; color: #555;">Email</td>
              <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #555;">Subject</td>
              <td style="padding: 8px;">${subject}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; color: #555; vertical-align: top;">Message</td>
              <td style="padding: 8px; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Sent via plugandplayagents.com contact form
          </p>
        </div>
      `,
    });

    // Auto-reply to the USER
    await transporter.sendMail({
      from: `"Plug and Play Agent" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We got your message, ${name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Thanks for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and our team will get back to you within 24 hours.</p>
          <p style="background: #f5f5ff; padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <strong>Your message:</strong><br/><br/>
            ${message}
          </p>
          <p>In the meantime, feel free to check out our <a href="https://plugandplayagents.com/support" style="color: #6366f1;">Support page</a> for quick answers.</p>
          <p>— The Plug and Play Agent Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;"/>
          <p style="color: #999; font-size: 12px;">
            Plug and Play Agent · Built for Instagram growth
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact API Error:", message);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}