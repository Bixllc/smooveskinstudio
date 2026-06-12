"use client";

import Image from "next/image";
import { useState } from "react";

const CLIENT_SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG ?? "smooveskinstudio";

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", form);
  };

  return (
    <section id="contact" className="py-24" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div
          className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
          style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.12)" }}
        >
          {/* Left — Studio image */}
          <div className="relative hidden lg:block" style={{ minHeight: "620px" }}>
            <Image
              src="/images/studio.jpg"
              alt="Smoove Skin Studio"
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent 60%)" }}
            />
            <div className="absolute bottom-8 left-8 text-white">
              <p
                className="text-xs tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Address
              </p>
              <p className="text-sm font-medium">7600 Denton Hwy, Suite #139</p>
              <p className="text-sm">Watauga, Texas</p>
              <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                Tue–Sat · 10am–6pm
              </p>
              <p className="text-sm mt-1 font-medium">(682) 241-2984</p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="p-10 md:p-14" style={{ backgroundColor: "#2E1F17" }}>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                fontWeight: 300,
                color: "#FAF8F5",
                lineHeight: 1.1,
              }}
            >
              Send us a message
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(250,248,245,0.6)" }}>
              Experience personalized care in a calm, private studio — designed for your comfort.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#FAF8F5",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#FAF8F5",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#FAF8F5",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#FAF8F5",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
              <textarea
                placeholder="Tell us what you're looking for..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#FAF8F5",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
              <a
                href={`/${CLIENT_SLUG}/book`}
                className="mt-2 w-full py-4 rounded-full text-sm font-medium text-center text-white transition-all hover:opacity-90 block"
                style={{ backgroundColor: "#C4A882" }}
              >
                Book Your Session →
              </a>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
