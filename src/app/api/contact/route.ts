import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

// ── Email configuration (see .env.local) ──
// SMTP_HOST           SMTP server, e.g. smtp.gmail.com
// SMTP_PORT           465 (implicit TLS, default) or 587 (STARTTLS)
// SMTP_USER           mailbox used to log in to the SMTP server
// SMTP_PASS           its password (for Gmail/Zoho, an app password)
// CONTACT_TO_EMAIL    inbox that receives enquiries (comma-separate for several)
// CONTACT_FROM_EMAIL  sender; most providers require this to be SMTP_USER or one of its aliases
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
    : null;
const TO_EMAIL = (process.env.CONTACT_TO_EMAIL || "admin@noyyalstudios.com")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || `Noyyal Studios <${process.env.SMTP_USER}>`;
// Bare address of the sender. Each email is sent as "<customer name> via Noyyal Studios <this address>":
// the customer's own address can't be the sender (Gmail rewrites it, and spoofing fails SPF/DMARC),
// so it goes in Reply-To instead.
const FROM_ADDRESS = FROM_EMAIL.match(/<([^>]+)>/)?.[1] ?? FROM_EMAIL;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml({ name, email, subject, message }: Record<string, string>) {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px 8px 0;color:#777;font-size:12px;letter-spacing:2px;vertical-align:top;white-space:nowrap">${label}</td>
      <td style="padding:8px 0;color:#111;font-size:14px">${value}</td>
    </tr>`;

  return `
  <div style="font-family:'Courier New',Courier,monospace;background:#f4f3ef;padding:32px">
    <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #111;padding:28px">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#777">NOYYAL STUDIOS · NEW ENQUIRY</p>
      <h2 style="margin:0 0 20px;font-size:20px;color:#111">${escapeHtml(subject || "No subject")}</h2>
      <table style="border-collapse:collapse;width:100%;border-top:1px dashed #999;border-bottom:1px dashed #999">
        ${row("_name", escapeHtml(name))}
        ${row("_email", `<a href="mailto:${escapeHtml(email)}" style="color:#111">${escapeHtml(email)}</a>`)}
        ${row("_subject", escapeHtml(subject || "—"))}
      </table>
      <p style="margin:20px 0 6px;font-size:12px;letter-spacing:2px;color:#777">_message</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#111">${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      <p style="margin:28px 0 0;font-size:11px;color:#ed1c2e">Reply to this email to answer ${escapeHtml(name)} directly.</p>
    </div>
  </div>`;
}

// Confirmation sent back to the customer after their enquiry is received
function buildAutoReplyHtml(name: string) {
  return `
  <div style="font-family:'Courier New',Courier,monospace;background:#f4f3ef;padding:32px">
    <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #111;padding:28px">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#777">NOYYAL STUDIOS</p>
      <h2 style="margin:0 0 20px;font-size:20px;color:#111">Thanks for contacting us</h2>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#111">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#111">
        We have received your enquiry. Our team will get back to you within 1–2 days.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#111">Regards,<br/>Noyyal Studios</p>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }
    if (name.length > 200 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ message: "Your message is too long." }, { status: 400 });
    }

    // 1. Save to Firebase Firestore
    let savedToFirestore = false;
    try {
      const isRealFirebase = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                             process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "placeholder-project-id";

      if (isRealFirebase) {
        await addDoc(collection(db, "enquiries"), {
          name,
          email,
          subject: subject || "No Subject",
          message,
          timestamp: new Date().toISOString(),
        });
        savedToFirestore = true;
      } else {
        console.log("Firebase not configured. Enquiry payload:", { name, email, subject, message });
      }
    } catch (firebaseError) {
      console.error("Firebase Firestore save failed:", firebaseError);
    }

    // 2. Dispatch email via SMTP
    let emailSent = false;
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: { name: `${name} via Noyyal Studios`, address: FROM_ADDRESS },
          to: TO_EMAIL,
          replyTo: email,
          subject: `New enquiry: ${subject || "No subject"} — ${name}`,
          html: buildEmailHtml({ name, email, subject, message }),
          text: `New enquiry from ${name} <${email}>\nSubject: ${subject || "No subject"}\n\n${message}`,
        });
        console.log("Enquiry email accepted for:", info.accepted, "rejected:", info.rejected);
        emailSent = true;
      } catch (smtpError) {
        console.error("SMTP delivery failed:", smtpError);
      }
    } else {
      console.warn("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — enquiry email was not sent.");
    }

    // Only tell the visitor it worked if the enquiry actually landed somewhere
    if (!emailSent && !savedToFirestore) {
      return NextResponse.json(
        { message: `We couldn't send your message right now. Please email us at ${TO_EMAIL[0]}.` },
        { status: 502 }
      );
    }

    // 3. Confirmation email to the customer — only once the enquiry has landed, and a failure
    //    here doesn't fail the request (the studio already has the enquiry)
    let autoReplySent = false;
    if (transporter) {
      try {
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: email,
          replyTo: TO_EMAIL,
          subject: "Thanks for contacting Noyyal Studios",
          html: buildAutoReplyHtml(name),
          text: `Hi ${name},\n\nThanks for contacting us. We have received your enquiry. Our team will get back to you within 1–2 days.\n\nRegards,\nNoyyal Studios`,
        });
        autoReplySent = true;
      } catch (smtpError) {
        console.error("Auto-reply to customer failed:", smtpError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry processed successfully.",
        savedToFirestore,
        emailSent,
        autoReplySent
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
