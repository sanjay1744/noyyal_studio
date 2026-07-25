"use client";

import { useState } from "react";
import Footer from "@/components/ui/Footer";
import { clsx } from "clsx";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit enquiry.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
      const errMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(errMsg);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 border-b border-light-gray select-none">
        {/* Left Side: Metadata & Details */}
        <div className="p-12 px-8 md:px-12 border-b md:border-b-0 md:border-r border-light-gray flex flex-col justify-between">
          <div>
            <h1 className="font-syne text-[clamp(44px,4.5vw,72px)] font-extrabold leading-[0.9] tracking-tighter mt-6 mb-12">
              Let&apos;s<br />
              <span className="font-normal italic font-playfair text-gray">talk.</span>
            </h1>

            <div className="flex flex-col border-t border-light-gray">
              <div className="flex items-baseline py-4 border-b border-light-gray gap-5">
                <span className="text-[9px] tracking-[0.2em] text-gray uppercase w-20 shrink-0">Studio</span>
                <span className="text-[12px] tracking-wide text-black">Chennai, Tamil Nadu, India</span>
              </div>
              <div className="flex items-baseline py-4 border-b border-light-gray gap-5">
                <span className="text-[9px] tracking-[0.2em] text-gray uppercase w-20 shrink-0">Email</span>
                <a href="mailto:studio@noyyal.studio" className="text-[12px] tracking-wide text-black hover:opacity-50 transition-opacity cursor-none no-underline">
                  studio@noyyal.studio
                </a>
              </div>
              <div className="flex items-baseline py-4 border-b border-light-gray gap-5">
                <span className="text-[9px] tracking-[0.2em] text-gray uppercase w-20 shrink-0">Enquiries</span>
                <span className="text-[12px] tracking-wide text-black leading-snug">
                  Residential projects & research collaborations welcome
                </span>
              </div>
              <div className="flex items-baseline py-4 border-b border-light-gray gap-5">
                <span className="text-[9px] tracking-[0.2em] text-gray uppercase w-20 shrink-0">Response</span>
                <span className="text-[12px] tracking-wide text-black">Within 3 working days</span>
              </div>
            </div>
          </div>
          
          <div className="text-[9px] tracking-[0.15em] text-gray uppercase leading-relaxed mt-12 hidden md:block">
            Noyyal Studios<br />Est. 2018 · Chennai
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="p-12 px-8 md:p-12 md:px-12 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            <h2 className="text-[9px] tracking-[0.3em] text-gray uppercase mb-8">Send an enquiry</h2>
            
            {status === "success" && (
              <div className="p-4 bg-green-50 text-green-800 text-[10px] tracking-widest uppercase mb-6 select-none font-semibold border border-green-200">
                Thank you — we&apos;ll be in touch within 3 working days.
              </div>
            )}

            {status === "error" && (
              <div className="p-4 bg-red-50 text-red-800 text-[10px] tracking-widest uppercase mb-6 select-none font-semibold border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-0">
              {/* Name */}
              <div className="border-b border-light-gray py-4 flex flex-col gap-1 focus-within:border-black transition-colors duration-200">
                <label className="text-[9px] tracking-[0.2em] text-gray uppercase">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  disabled={status === "submitting"}
                  className="bg-transparent border-none outline-none font-dm-mono text-[12px] text-black tracking-wide cursor-none"
                />
              </div>

              {/* Email */}
              <div className="border-b border-light-gray py-4 flex flex-col gap-1 focus-within:border-black transition-colors duration-200">
                <label className="text-[9px] tracking-[0.2em] text-gray uppercase">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  disabled={status === "submitting"}
                  className="bg-transparent border-none outline-none font-dm-mono text-[12px] text-black tracking-wide cursor-none"
                />
              </div>

              {/* Subject */}
              <div className="border-b border-light-gray py-4 flex flex-col gap-1 focus-within:border-black transition-colors duration-200">
                <label className="text-[9px] tracking-[0.2em] text-gray uppercase">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Residential project enquiry"
                  disabled={status === "submitting"}
                  className="bg-transparent border-none outline-none font-dm-mono text-[12px] text-black tracking-wide cursor-none"
                />
              </div>

              {/* Message */}
              <div className="border-b border-light-gray py-4 flex flex-col gap-1 focus-within:border-black transition-colors duration-200">
                <label className="text-[9px] tracking-[0.2em] text-gray uppercase">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project or enquiry..."
                  rows={4}
                  required
                  disabled={status === "submitting"}
                  className="bg-transparent border-none outline-none font-dm-mono text-[12px] text-black tracking-wide resize-none min-h-[80px] cursor-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className={clsx(
                "mt-8 py-3.5 px-8 bg-black text-[#f4f3ef] font-dm-mono text-[9.5px] tracking-[0.25em] uppercase border-none cursor-none hover:opacity-75 transition-opacity self-start",
                status === "submitting" && "opacity-50 pointer-events-none"
              )}
            >
              {status === "submitting" ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className="text-[9px] tracking-[0.15em] text-gray uppercase leading-relaxed mt-12 block md:hidden">
            Noyyal Studios Est. 2018 · Chennai
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
