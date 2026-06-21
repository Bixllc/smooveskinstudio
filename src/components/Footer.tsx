"use client";

import Image from "next/image";
import { useState } from "react";

type Category = { id: string; name: string };

const CONTACT = {
  address: "7600 Denton Hwy, Suite #139",
  city: "Watauga, Texas",
  addressNote: "Inside Mattison Avenue Salon Suites",
  hours: "Tue–Sat · 10am–6pm",
  phone: "(682) 241-2984",
  phoneHref: "tel:+16822412984",
};

const columnHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--home-font-sans), sans-serif",
  fontWeight: 500,
  fontSize: 11,
  letterSpacing: "2px",
  color: "#9A6A4E",
  marginBottom: 18,
};

export default function Footer({
  categories = [],
  clientSlug = "smooveskinstudio",
}: {
  categories?: Category[];
  clientSlug?: string;
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Footer email signup:", email);
    setEmail("");
    setSubscribed(true);
  };

  return (
    <footer style={{ backgroundColor: "#F4EDE2", padding: "80px 48px 40px" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto" }}>
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 0.8fr 1fr 1.5fr",
            gap: 48,
            paddingBottom: 56,
            borderBottom: "1px solid rgba(154,106,78,0.22)",
          }}
        >
          {/* Column 1 — Brand */}
          <div>
            <Image
              src="/images/logo.avif"
              alt="Smoove Skin Studio"
              width={220}
              height={88}
              style={{ height: 88, width: "auto", mixBlendMode: "multiply", margin: "0 0 20px -6px" }}
            />
            <p
              style={{
                maxWidth: 260,
                fontFamily: "var(--home-font-sans), sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.6,
                color: "#6A5447",
              }}
            >
              Private. Intentional. Yours. Award-winning waxing &amp; skin care in the DFW metroplex.
            </p>
          </div>

          {/* Column 2 — Navigate */}
          <div>
            <h4 style={columnHeadingStyle}>NAVIGATE</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Home", "About", "Services", "Contact"].map((link) => (
                <a
                  key={link}
                  href={link === "Home" ? "/" : `#${link.toLowerCase()}`}
                  className="footer-link"
                  style={{
                    fontFamily: "var(--home-font-sans), sans-serif",
                    fontWeight: 300,
                    fontSize: 14,
                    color: "#6A5447",
                    textDecoration: "none",
                    transition: "color 150ms ease",
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3 — Visit */}
          <div>
            <h4 style={columnHeadingStyle}>VISIT</h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontFamily: "var(--home-font-sans), sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.55,
                color: "#6A5447",
              }}
            >
              <p style={{ margin: 0 }}>{CONTACT.address}</p>
              <p style={{ margin: 0 }}>{CONTACT.city}</p>
              <p style={{ margin: 0, color: "#9A6A4E" }}>{CONTACT.addressNote}</p>
              <p style={{ margin: 0 }}>{CONTACT.hours}</p>
              <a
                href={CONTACT.phoneHref}
                className="footer-link"
                style={{ color: "#2E1F17", fontWeight: 500, textDecoration: "none", transition: "color 150ms ease" }}
              >
                {CONTACT.phone}
              </a>
            </div>
          </div>

          {/* Column 4 — Newsletter card */}
          <div>
            <div
              style={{
                backgroundColor: "#FBF7F0",
                border: "1px solid rgba(154,106,78,0.18)",
                borderRadius: 20,
                padding: "28px 28px 30px",
              }}
            >
              <h4
                style={{
                  fontFamily: "var(--home-font-serif), serif",
                  fontWeight: 600,
                  fontSize: 23,
                  lineHeight: 1.15,
                  color: "#2E1F17",
                }}
              >
                Skin Tips, Studio Updates &amp; Exclusive Deals.
              </h4>
              <p
                style={{
                  marginTop: 10,
                  fontFamily: "var(--home-font-sans), sans-serif",
                  fontWeight: 300,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "#6A5447",
                }}
              >
                Join 500+ clients who get early access to new services, seasonal offers, and
                Anisha&apos;s personal skin care advice.
              </p>
              <form onSubmit={handleSubmit} style={{ marginTop: 18, display: "flex", gap: 10 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  style={{
                    flex: 1,
                    minWidth: 0,
                    backgroundColor: "#fff",
                    border: "1px solid rgba(154,106,78,0.3)",
                    borderRadius: 40,
                    padding: "12px 18px",
                    fontFamily: "var(--home-font-sans), sans-serif",
                    fontWeight: 300,
                    fontSize: 13.5,
                    color: "#2E1F17",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  className="footer-join-btn"
                  style={{
                    flexShrink: 0,
                    backgroundColor: "#2E1F17",
                    color: "#F4EDE2",
                    border: "none",
                    borderRadius: 40,
                    padding: "12px 24px",
                    fontFamily: "var(--home-font-sans), sans-serif",
                    fontWeight: 300,
                    fontSize: 13,
                    letterSpacing: "0.5px",
                    cursor: "pointer",
                    transition: "background 150ms ease",
                  }}
                >
                  {subscribed ? "✓" : "Join"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
            paddingTop: 26,
          }}
        >
          <p
            style={{
              fontFamily: "var(--home-font-sans), sans-serif",
              fontWeight: 300,
              fontSize: 12.5,
              color: "#8A7363",
              margin: 0,
            }}
          >
            © 2026 Smoove Skin Studio. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 26 }}>
            <a
              href="#"
              className="footer-link"
              style={{
                fontFamily: "var(--home-font-sans), sans-serif",
                fontWeight: 300,
                fontSize: 12.5,
                color: "#8A7363",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
            >
              Privacy Policy
            </a>
            <a
              href="https://www.bixllc.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={{
                fontFamily: "var(--home-font-sans), sans-serif",
                fontWeight: 300,
                fontSize: 12.5,
                color: "#8A7363",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
            >
              Website by Bix
            </a>
            <a
              href="#"
              className="footer-link"
              style={{
                fontFamily: "var(--home-font-sans), sans-serif",
                fontWeight: 300,
                fontSize: 12.5,
                color: "#8A7363",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: #2E1F17 !important; }
        .footer-join-btn:hover { background-color: #4A372C !important; }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
        }
      `}</style>
    </footer>
  );
}
