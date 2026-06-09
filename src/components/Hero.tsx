"use client";

import Image from "next/image";
import Link from "next/link";

const CLIENT_SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG ?? "smooveskinstudio";

const trustPoints = [
  {
    label: "Award-Winning Care",
    description: "Trusted expertise with exceptional results.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    label: "Premium Products & Hygiene",
    description: "High-quality products in a clean, comfortable space.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5c0-2.5 2-4 5.5-4s5.5 1.5 5.5 4c0 4-5.5 11-5.5 11S6.5 10.5 6.5 6.5z"/>
        <path d="M12 2.5v15"/>
      </svg>
    ),
  },
  {
    label: "Comfort Meets Confidence",
    description: "Care designed to help you feel confident in your skin.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
];

export default function Hero() {
  return (
    <section className="pt-28 pb-0 bg-[var(--color-bg)]">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Text */}
          <div>
            <h1
              className="font-light tracking-tight text-[var(--color-text)]"
              style={{ fontSize: "clamp(3.2rem, 7vw, 6rem)", lineHeight: 1.0 }}
            >
              <span className="block">Smoove</span>
              <span className="block text-[var(--color-primary)] italic" style={{ fontFamily: "var(--font-heading)" }}>
                Skin
              </span>
              <span className="block">Studio</span>
            </h1>

            {/* Divider */}
            <div
              className="mt-6 mb-7"
              style={{ width: "48px", height: "2px", backgroundColor: "var(--color-primary)" }}
            />

            <p className="text-base leading-relaxed text-[var(--color-text-light)] max-w-[420px]">
              Award-winning waxing care in DFW with precision, comfort, and results
              that leave your skin smoother, cleaner, and more confident.
            </p>

            <p className="mt-6 text-xs font-bold tracking-[0.15em] text-[var(--color-primary-dark)] uppercase">
              Full Body Brazilian Waxing&nbsp;•&nbsp;DFW Area
            </p>

            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <Link
                href={`/${CLIENT_SLUG}/book`}
                className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-lg text-sm font-medium tracking-wide text-white transition-all duration-200 hover:brightness-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Book Your Session <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>›</span>
              </Link>
              <a
                href="#services"
                className="inline-flex items-center px-7 py-3.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 hover:bg-[var(--color-bg-light)]"
                style={{
                  border: "1.5px solid var(--color-primary)",
                  color: "var(--color-primary-dark)",
                }}
              >
                Explore Services
              </a>
            </div>
          </div>

          {/* Right — Image */}
          <div className="relative">
            <div
              className="overflow-hidden"
              style={{ borderRadius: "24px", boxShadow: "0 24px 64px rgba(0,0,0,0.10)" }}
            >
              <Image
                src="/images/hero-facial.png"
                alt="Anisha performing a waxing treatment at Smoove Skin Studio"
                width={900}
                height={1100}
                className="w-full object-cover object-top"
                style={{ maxHeight: "620px" }}
                priority
              />
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border)]"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {trustPoints.map((point) => (
            <div key={point.label} className="flex items-start gap-5 px-8 py-7 bg-[var(--color-bg)]">
              <div className="flex-shrink-0 text-[var(--color-primary)] mt-0.5">
                {point.icon}
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.12em] uppercase text-[var(--color-text)]">
                  {point.label}
                </p>
                <p className="mt-1.5 text-sm text-[var(--color-text-light)] leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
