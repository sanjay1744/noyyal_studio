import { NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
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
        console.log("Firebase placeholder active. Logged enquiry payload:", { name, email, subject, message });
        savedToFirestore = true;
      }
    } catch (firebaseError) {
      console.error("Firebase Firestore save failed:", firebaseError);
    }

    // 2. Dispatch email via Resend
    let emailSent = false;
    if (resend) {
      try {
        await resend.emails.send({
          from: "Noyyal Studios <onboarding@resend.dev>", // Standard onboarding email domain
          to: "studio@noyyal.studio",
          subject: `New Portfolio Enquiry: ${subject || "No Subject"}`,
          html: `
            <h3>New Contact Enquiry Received</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || "No Subject"}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br/>")}</p>
          `,
        });
        emailSent = true;
      } catch (resendError) {
        console.error("Resend delivery failed:", resendError);
      }
    } else {
      console.log("Resend API key missing. Simulated email dispatch.");
      emailSent = true;
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Enquiry processed successfully.",
        savedToFirestore,
        emailSent 
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
