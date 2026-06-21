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
        <div style={{ maxWidth: 560 }}>
          <h1
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
            style={{
              fontSize: 17.5,
              fontWeight: 300,
              lineHeight: 1.65,
              color: "#5A463A",
              maxWidth: 460,
              marginBottom: 38,
            }}
          >
            Precision waxing and skin care in the DFW area — built on comfort, hygiene, and results
            that leave you smoother, cleaner, and more confident in your skin.
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

          {/* Trust bar */}
          <div className="mt-14" style={{ paddingTop: 30, borderTop: "1px solid rgba(154,106,78,0.20)" }}>
            <div className="trust-row" style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
              <div className="trust-item">
                <div style={{ color: "#C8A56B", fontSize: 15, letterSpacing: "2px" }}>★★★★★</div>
                <p className="text-sm mt-1" style={{ fontSize: 12.5, fontWeight: 300, color: "#5A463A" }}>
                  Loved by 500+ DFW clients
                </p>
              </div>
              <div className="trust-divider" style={{ width: 1, height: 38, background: "rgba(154,106,78,0.22)" }} />
              <div className="trust-item">
                <p style={{ fontFamily: "var(--home-font-serif), serif", fontSize: 22, fontWeight: 600, color: "#2E1F17" }}>
                  Award-Winning
                </p>
                <p className="text-sm mt-1" style={{ fontSize: 12.5, fontWeight: 300, color: "#5A463A" }}>
                  Wax Specialist
                </p>
              </div>
              <div className="trust-divider" style={{ width: 1, height: 38, background: "rgba(154,106,78,0.22)" }} />
              <div className="trust-item">
                <p style={{ fontFamily: "var(--home-font-serif), serif", fontSize: 22, fontWeight: 600, color: "#2E1F17" }}>
                  Clean
                </p>
                <p className="text-sm mt-1" style={{ fontSize: 12.5, fontWeight: 300, color: "#5A463A" }}>
                  Organic products only
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Image composition */}
        <div
          className="relative flex hero-right"
          style={{ justifyContent: "center", alignItems: "flex-end" }}
        >
          {/* Main arch image */}
          <div
            className="relative z-10 overflow-hidden"
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
            className="absolute z-20 overflow-hidden"
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
              src="/images/treatment-oil.png"
              alt="Aftercare oil application at Smoove Skin Studio"
              fill
              sizes="196px"
              className="object-cover"
              style={{ objectPosition: "56% 20%" }}
            />
          </div>
        </div>

      </div>

      <style>{`
        .smoove-hero-cta:hover { background: #2E1F17 !important; }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 44px !important;
            padding-left: 26px !important;
            padding-right: 26px !important;
            padding-top: 14px !important;
            padding-bottom: 64px !important;
          }
          .hero-right { justify-content: flex-start !important; }
        }
        @media (max-width: 600px) {
          .trust-row { flex-wrap: nowrap; gap: 14px; }
          .trust-item { flex: 1 1 auto; min-width: 0; }
          .trust-divider { flex-shrink: 0; height: 30px !important; }
        }
      `}</style>
    </section>
  );
}
