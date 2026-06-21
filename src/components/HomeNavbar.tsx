"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const BOOKING_URL = "https://smooveskin.as.me/schedule/64a2c692";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export default function HomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 16,
          zIndex: 50,
          marginTop: 20,
          padding: "0 24px",
        }}
      >
        <div
          className="smoove-nav-pill"
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            padding: "10px 14px 10px 26px",
            background: "rgba(251,247,240,0.82)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(154,106,78,0.18)",
            borderRadius: 999,
            boxShadow: "0 14px 34px -18px rgba(58,40,30,0.30)",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0 }}>
            <Image
              src="/images/logo-transparent.avif"
              alt="Smoove Skin Studio"
              width={180}
              height={72}
              style={{ height: 46, width: "auto", mixBlendMode: "multiply" }}
              priority
            />
          </Link>

          {/* Nav links — desktop only */}
          <ul
            className="smoove-nav-links"
            style={{ display: "flex", alignItems: "center", gap: 34, listStyle: "none" }}
          >
            {NAV_LINKS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="smoove-nav-link"
                  style={{
                    fontSize: 14,
                    fontWeight: 300,
                    letterSpacing: "0.5px",
                    color: "#4A372C",
                    textDecoration: "none",
                    transition: "color 150ms ease",
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA — desktop only */}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="smoove-nav-cta"
            style={{
              fontSize: 13,
              fontWeight: 300,
              letterSpacing: "0.6px",
              color: "#F4EDE2",
              background: "#3A281E",
              padding: "13px 26px",
              borderRadius: 999,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "background 150ms ease",
            }}
          >
            Book Your Session
          </a>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="smoove-hamburger"
            aria-label="Toggle menu"
            style={{
              display: "none",
              width: 46,
              height: 46,
              borderRadius: "50%",
              border: "1px solid rgba(154,106,78,0.22)",
              background: "rgba(251,247,240,0.6)",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3A281E" strokeWidth="1.7" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="smoove-mobile-menu"
            style={{
              maxWidth: 1180,
              margin: "12px auto 0",
              background: "rgba(251,247,240,0.96)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(154,106,78,0.18)",
              borderRadius: 28,
              boxShadow: "0 18px 40px -20px rgba(58,40,30,0.34)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              animation: "smoove-menu-in 0.22s ease",
            }}
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="smoove-mobile-link"
                style={{
                  fontSize: 16,
                  fontWeight: 300,
                  letterSpacing: "0.4px",
                  color: "#3A281E",
                  textDecoration: "none",
                  padding: "14px 18px",
                  borderRadius: 16,
                  transition: "background 150ms ease",
                }}
              >
                {item.label}
              </a>
            ))}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: 13,
                fontWeight: 300,
                letterSpacing: "0.6px",
                color: "#F4EDE2",
                background: "#3A281E",
                padding: "13px 26px",
                borderRadius: 999,
                textDecoration: "none",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Book Your Session
            </a>
          </div>
        )}
      </header>

      <style>{`
        @keyframes smoove-menu-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .smoove-nav-link:hover { color: #9A6A4E !important; }
        .smoove-nav-cta:hover { background: #2E1F17 !important; }
        .smoove-mobile-link:hover { background: rgba(154,106,78,0.1); }
        .smoove-home :focus-visible {
          outline: 2px solid #9A6A4E;
          outline-offset: 3px;
          border-radius: 4px;
        }
        .smoove-home ::selection {
          background: #C8A56B;
          color: #2E1F17;
        }
        @media (max-width: 900px) {
          .smoove-nav-links { display: none !important; }
          .smoove-nav-cta { display: none !important; }
          .smoove-hamburger { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
