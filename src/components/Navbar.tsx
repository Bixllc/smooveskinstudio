"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CLIENT_SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG ?? "smooveskinstudio";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Floating pill navbar */}
      <nav
        style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          width: "fit-content",
          maxWidth: "min(900px, calc(100vw - 32px))",
        }}
      >
        <div
          className="flex items-center justify-between gap-6 px-6 py-3"
          style={{
            borderRadius: "9999px",
            background: "rgba(18, 15, 13, 0.28)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.14)",
            minWidth: "min(860px, calc(100vw - 32px))",
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
          }}
        >
          {/* Left — Nav links (hidden on mobile) */}
          <ul className="hidden md:flex items-center gap-7">
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "#about" },
              { label: "Services", href: "#services" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-white/75 hover:text-white transition-colors"
                  style={{ fontSize: "0.85rem", letterSpacing: "0.01em" }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile — hamburger */}
          <button
            className="flex md:hidden flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>

          {/* Center — Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo-transparent.avif"
              alt="Smoove Skin Studio"
              width={180}
              height={72}
              className="h-14 w-auto brightness-0 invert"
              priority
            />
          </Link>

          {/* Right — Phone + CTA */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+16822412984"
              className="hidden md:flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
              style={{ fontSize: "0.8rem" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13.5a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2.73h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 10.4a16 16 0 005.7 5.7l.94-.94a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.07 18.5l-.15-.58z" />
              </svg>
              (682) 241-2984
            </a>

            <a
              href={`/${CLIENT_SLUG}/book`}
              className="flex items-center gap-1 px-5 py-2 text-[var(--color-text)] font-medium transition-all duration-200 hover:brightness-95"
              style={{
                borderRadius: "9999px",
                backgroundColor: "white",
                fontSize: "0.82rem",
                letterSpacing: "0.01em",
              }}
            >
              Book Your Session
              <span style={{ fontSize: "1rem", lineHeight: 1 }}>›</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="fixed z-40 left-4 right-4 rounded-2xl overflow-hidden"
          style={{
            top: "90px",
            background: "rgba(18, 15, 13, 0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <ul className="flex flex-col py-4">
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "#about" },
              { label: "Services", href: "#services" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3.5 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  style={{ fontSize: "0.95rem" }}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="px-6 pt-2 pb-3">
              <a
                href="tel:+16822412984"
                className="text-white/50 text-sm"
              >
                (682) 241-2984
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
