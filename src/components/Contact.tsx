"use client";

import Image from "next/image";
import { useState } from "react";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--home-font-sans), sans-serif",
  fontWeight: 300,
  fontSize: 11,
  letterSpacing: "2px",
  color: "rgba(244,237,226,0.7)",
};

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactSent, setContactSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", form);
    setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
    setContactSent(true);
  };

  return (
    <section
      id="contact"
      className="contact-section"
      style={{ backgroundColor: "#F4EDE2", padding: "100px 48px" }}
    >
      <div
        className="contact-shell"
        style={{
          maxWidth: 1340,
          margin: "0 auto",
          borderRadius: 34,
          overflow: "hidden",
          border: "1px solid rgba(154,106,78,0.16)",
          boxShadow: "0 40px 90px -44px rgba(58,40,30,0.42)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {/* Left — image with floating glass info card */}
        <div className="contact-image relative" style={{ minHeight: 620 }}>
          <Image
            src="/images/contact-studio.png"
            alt="Smoove Skin Studio neon sign and waxing station"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="object-cover"
            style={{ objectPosition: "50% 30%" }}
          />

          <div
            className="absolute"
            style={{
              left: 36,
              right: 36,
              bottom: 36,
              backgroundColor: "rgba(46,31,23,0.42)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(244,237,226,0.22)",
              borderRadius: 22,
              padding: "30px 32px",
              color: "#F4EDE2",
            }}
          >
            {/* Phone row */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  flexShrink: 0,
                  borderRadius: "50%",
                  backgroundColor: "#F4EDE2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E1F17" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <p style={labelStyle}>PHONE</p>
                <p
                  style={{
                    fontFamily: "var(--home-font-serif), serif",
                    fontWeight: 600,
                    fontSize: 28,
                    lineHeight: 1,
                    color: "#F4EDE2",
                  }}
                >
                  (682) 241-2984
                </p>
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(244,237,226,0.2)", margin: "26px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <p style={labelStyle}>ADDRESS</p>
                <p
                  style={{
                    marginTop: 9,
                    fontFamily: "var(--home-font-sans), sans-serif",
                    fontWeight: 300,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "#F4EDE2",
                  }}
                >
                  7600 Denton Hwy, Suite #139
                  <br />
                  Watauga, Texas
                </p>
              </div>
              <div>
                <p style={labelStyle}>STUDIO HOURS</p>
                <p
                  style={{
                    marginTop: 9,
                    fontFamily: "var(--home-font-sans), sans-serif",
                    fontWeight: 300,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "#F4EDE2",
                  }}
                >
                  Tue–Sat · 10am – 6pm
                  <br />
                  Sun &amp; Mon · Closed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ backgroundColor: "#2E1F17", padding: "clamp(44px, 4vw, 64px)" }}>
          <h2
            style={{
              fontFamily: "var(--home-font-serif), serif",
              fontWeight: 500,
              fontSize: "clamp(34px, 3.2vw, 48px)",
              lineHeight: 1.04,
              letterSpacing: "-0.5px",
              color: "#F4EDE2",
            }}
          >
            Send us a message
          </h2>
          <p
            style={{
              marginTop: 12,
              maxWidth: 440,
              fontFamily: "var(--home-font-sans), sans-serif",
              fontWeight: 300,
              fontSize: 16,
              lineHeight: 1.6,
              color: "rgba(244,237,226,0.72)",
            }}
          >
            Experience personalized care in a calm, private studio — designed for your comfort.
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 22 }}>
            <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <Field label="First Name">
                <input
                  type="text"
                  placeholder="Ali"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="contact-input"
                  style={{ borderRadius: 999 }}
                />
              </Field>
              <Field label="Last Name">
                <input
                  type="text"
                  placeholder="Tufan"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="contact-input"
                  style={{ borderRadius: 999 }}
                />
              </Field>
            </div>

            <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <Field label="Email Address">
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="contact-input"
                  style={{ borderRadius: 999 }}
                />
              </Field>
              <Field label="Phone Number">
                <input
                  type="tel"
                  placeholder="(682) 000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="contact-input"
                  style={{ borderRadius: 999 }}
                />
              </Field>
            </div>

            <Field label="Message">
              <textarea
                placeholder="Tell us what you're looking for…"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="contact-input"
                style={{ borderRadius: 22, minHeight: 120, resize: "vertical" }}
              />
            </Field>

            <button
              type="submit"
              className="contact-submit"
              style={{
                width: "100%",
                marginTop: 4,
                backgroundColor: "#C8A56B",
                color: "#2E1F17",
                borderRadius: 999,
                padding: "18px 24px",
                border: "none",
                fontFamily: "var(--home-font-sans), sans-serif",
                fontWeight: 300,
                fontSize: 15,
                letterSpacing: "0.4px",
                cursor: "pointer",
                transition: "150ms ease",
              }}
            >
              {contactSent ? "Thank you — we'll be in touch ✓" : "Get In Touch →"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .contact-input {
          background-color: #FFFFFF;
          border: 1px solid rgba(154,106,78,0.18);
          font-family: var(--home-font-sans), sans-serif;
          font-weight: 300;
          font-size: 14px;
          color: #2E1F17;
          padding: 15px 22px;
          width: 100%;
          outline: none;
          transition: 150ms ease;
        }
        .contact-input:focus { border-color: #9A6A4E; }
        .contact-submit:hover { background-color: #B8945A !important; }
        @media (max-width: 900px) {
          .contact-shell { grid-template-columns: 1fr !important; }
          .contact-image { min-height: 420px !important; }
        }
        @media (max-width: 600px) {
          .contact-form-row { grid-template-columns: 1fr !important; }
          .contact-section { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <span
        style={{
          fontFamily: "var(--home-font-sans), sans-serif",
          fontWeight: 300,
          fontSize: 13.5,
          color: "rgba(244,237,226,0.82)",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
