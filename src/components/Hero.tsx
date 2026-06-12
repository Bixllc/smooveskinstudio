"use client";

import Image from "next/image";
import Link from "next/link";

const CLIENT_SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG ?? "smooveskinstudio";

export default function Hero() {
  return (
    <section
      style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh", paddingTop: "90px" }}
      className="relative overflow-hidden"
    >
      <div
        className="max-w-[1320px] mx-auto px-6 md:px-10 flex items-center"
        style={{ minHeight: "calc(100vh - 90px)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-8 items-center">

          {/* Left — Text */}
          <div className="py-16">
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(3rem, 5.5vw, 5rem)",
                lineHeight: 1.05,
                fontWeight: 300,
                color: "#2E1F17",
                letterSpacing: "-0.02em",
              }}
            >
              <span className="block">Smooth skin,</span>
              <span>
                <em style={{ color: "#9A6A4E", fontStyle: "italic" }}>refined</em>{" "}to you.
              </span>
            </h1>

            <p
              className="mt-6 leading-relaxed"
              style={{ fontSize: "1rem", color: "#6B5F54", maxWidth: "440px" }}
            >
              Precision waxing and skin care in the DFW area — built on comfort, hygiene, and results
              that leave you smoother, cleaner, and more confident in your skin.
            </p>

            <Link
              href={`/${CLIENT_SLUG}/book`}
              className="mt-10 inline-flex items-center gap-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#2E1F17", padding: "14px 32px" }}
            >
              Book Your Session <span>→</span>
            </Link>

            {/* Trust bar */}
            <div className="mt-14 pt-8" style={{ borderTop: "1px solid #D9D0C5" }}>
              <div className="flex items-start gap-8 flex-wrap">
                <div>
                  <div style={{ color: "#C4A56B", fontSize: "1rem", letterSpacing: "3px" }}>★★★★★</div>
                  <p className="text-sm mt-1" style={{ color: "#6B5F54" }}>Loved by 500+ DFW clients</p>
                </div>
                <div className="hidden sm:block w-px self-stretch" style={{ backgroundColor: "#D9D0C5" }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#2E1F17" }}>Award-Winning</p>
                  <p className="text-sm mt-1" style={{ color: "#6B5F54" }}>Wax Specialist</p>
                </div>
                <div className="hidden sm:block w-px self-stretch" style={{ backgroundColor: "#D9D0C5" }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#2E1F17" }}>Clean</p>
                  <p className="text-sm mt-1" style={{ color: "#6B5F54" }}>Organic products only</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Image composition */}
          <div
            className="relative hidden lg:block"
            style={{ height: "calc(100vh - 90px)", minHeight: "620px" }}
          >
            {/* Pink circle bg */}
            <div
              className="absolute"
              style={{
                width: "520px",
                height: "520px",
                borderRadius: "50%",
                backgroundColor: "#F2B8C0",
                top: "20px",
                right: "-80px",
              }}
            />

            {/* Main arch image */}
            <div
              className="absolute z-10 overflow-hidden"
              style={{
                width: "460px",
                height: "100%",
                top: 0,
                right: 0,
                borderRadius: "9999px 9999px 0 0",
              }}
            >
              <Image
                src="/images/cat-brow-services.jpg"
                alt="Precision brow waxing at Smoove Skin Studio"
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Floating secondary photo */}
            <div
              className="absolute z-20 overflow-hidden rounded-2xl shadow-xl"
              style={{
                width: "185px",
                height: "235px",
                bottom: "130px",
                left: "20px",
              }}
            >
              <Image
                src="/images/hero-waxing.png"
                alt="Anisha at Smoove Skin Studio"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
