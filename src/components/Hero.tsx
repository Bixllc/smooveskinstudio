"use client";

import Image from "next/image";
import Link from "next/link";

const BOOKING_URL = "https://smooveskin.as.me/schedule/64a2c692";

export default function Hero() {
  return (
    <section
      style={{ backgroundColor: "#F4EDE2", minHeight: "100vh", paddingTop: "90px" }}
      className="relative overflow-hidden"
    >
      {/* Pink ambient glow, top-right — pure CSS, no asset */}
      <div
        style={{
          position: "absolute",
          top: -180,
          right: -120,
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,201,208,0.55) 0%, rgba(244,201,208,0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Gold ambient glow, bottom-left — pure CSS, no asset */}
      <div
        style={{
          position: "absolute",
          bottom: -220,
          left: -160,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,165,107,0.30) 0%, rgba(200,165,107,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="max-w-[1340px] mx-auto px-12 hero-grid"
        style={{
          paddingTop: 18,
          paddingBottom: 80,
          display: "grid",
          gridTemplateColumns: "1.12fr 0.88fr",
          gap: 48,
          alignItems: "center",
          minHeight: "calc(100vh - 90px)",
          position: "relative",
        }}
      >
        {/* Left — Text */}
        <div className="hero-text-wrapper" style={{ maxWidth: 560 }}>
          <h1
            className="hero-heading"
            style={{
              fontFamily: "var(--home-font-serif), serif",
              fontSize: "clamp(44px, 4vw, 60px)",
              lineHeight: 1.02,
              letterSpacing: "-0.5px",
              fontWeight: 500,
              color: "#2E1F17",
              marginBottom: 26,
            }}
          >
            <span className="block">Smooth skin,</span>
            <span>
              <em style={{ color: "#9A6A4E", fontStyle: "italic" }}>refined</em>{" "}to you.
            </span>
          </h1>

          <p
            className="hero-paragraph"
            style={{
              fontSize: 17.5,
              fontWeight: 300,
              lineHeight: 1.65,
              color: "#5A463A",
              maxWidth: 460,
              marginBottom: 22,
            }}
          >
            Get waxed by an award winning specialist with precision, care, and results you love.
            At Smoove Skin Studio, every service is designed to leave your skin smoother, cleaner,
            and more confident than ever.
          </p>

          <p
            className="hero-tagline"
            style={{
              fontFamily: "var(--home-font-sans), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(11px, 3vw, 15px)",
              letterSpacing: "0.5px",
              color: "#2E1F17",
              whiteSpace: "nowrap",
              marginBottom: 38,
            }}
          >
            FULL BODY BRAZILIAN WAXING IN THE DFW AREA
          </p>

          <Link
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="smoove-hero-cta inline-flex items-center"
            style={{
              gap: 12,
              fontSize: 15,
              fontWeight: 300,
              color: "#F4EDE2",
              backgroundColor: "#3A281E",
              padding: "18px 32px",
              borderRadius: 44,
              textDecoration: "none",
              transition: "background 150ms ease",
            }}
          >
            Book Your Session <span style={{ fontSize: 17, lineHeight: 1 }}>→</span>
          </Link>
        </div>

        {/* Right — Image composition */}
        <div
          className="relative flex hero-right"
          style={{ justifyContent: "center", alignItems: "flex-end" }}
        >
          {/* Main arch image */}
          <div
            className="relative z-10 overflow-hidden hero-arch-image"
            style={{
              width: "100%",
              maxWidth: 440,
              aspectRatio: "44 / 58",
              borderRadius: "50% 50% 26px 26px / 38% 38% 4% 4%",
              boxShadow: "0 40px 80px -30px rgba(58,40,30,0.45)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <Image
              src="/images/hero-brow-arch.png"
              alt="Precision brow waxing at Smoove Skin Studio"
              fill
              sizes="440px"
              className="object-cover"
              style={{ objectPosition: "50% 35%" }}
              priority
            />
            {/* Inner gold arch frame */}
            <div
              style={{
                position: "absolute",
                inset: 12,
                border: "1px solid rgba(244,237,226,0.55)",
                borderRadius: "50% 50% 14px 14px / 36% 36% 3% 3%",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Floating secondary photo */}
          <div
            className="absolute z-20 overflow-hidden hero-secondary-photo"
            style={{
              width: 196,
              height: 244,
              left: -6,
              bottom: -10,
              borderRadius: 18,
              boxShadow: "0 24px 44px -20px rgba(58,40,30,0.5)",
              border: "5px solid #F4EDE2",
            }}
          >
            <Image
              src="/images/anisha-hero-secondary.jpg"
              alt="Anisha at Smoove Skin Studio"
              fill
              sizes="196px"
              className="object-cover"
              style={{ objectPosition: "50% 15%" }}
            />
          </div>
        </div>

      </div>

      <style>{`
        .smoove-hero-cta:hover { background: #2E1F17 !important; }
        @media (max-width: 900px) {
          .hero-grid {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 24px !important;
            padding-left: 26px !important;
            padding-right: 26px !important;
            padding-top: 14px !important;
            padding-bottom: 64px !important;
          }
          /* Lets heading/paragraph/tagline/CTA reorder alongside the image
             as if they were direct siblings, without changing desktop markup */
          .hero-text-wrapper { display: contents; }
          .hero-heading { order: 1; text-align: center; }
          .hero-paragraph { order: 2; text-align: center; margin-left: auto !important; margin-right: auto !important; }
          .hero-tagline { order: 3; text-align: center; }
          .hero-right {
            order: 4;
            width: 100% !important;
            max-width: 300px !important;
            margin: 0 auto !important;
            justify-content: center !important;
          }
          .smoove-hero-cta { order: 5; }
          .hero-secondary-photo {
            width: 140px !important;
            height: 174px !important;
            left: -4px !important;
            bottom: -8px !important;
          }
        }
      `}</style>
    </section>
  );
}
