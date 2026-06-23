"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useBookingGate } from "@/components/BookingPolicyGate";

const BOOKING_URL = "https://smooveskin.as.me/schedule/64a2c692";

export default function About() {
  const { requestBooking } = useBookingGate();
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (imageRef.current) observer.observe(imageRef.current);
    if (textRef.current) observer.observe(textRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .about-img { opacity: 0; transform: translateX(-30px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        .about-img.in-view { opacity: 1; transform: translateX(0); }
        .about-text { opacity: 0; transform: translateX(30px); transition: opacity 0.7s ease-out 0.1s, transform 0.7s ease-out 0.1s; }
        .about-text.in-view { opacity: 1; transform: translateX(0); }
      `}</style>

      <section id="about" className="py-24" style={{ backgroundColor: "#E8DDD1" }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Image — white card floating over a thin gold outline frame */}
            <div ref={imageRef} className="about-img relative">
              {/* Outline frame, offset behind the card */}
              <div
                className="absolute rounded-[28px]"
                style={{
                  inset: "-14px",
                  border: "1px solid rgba(200,165,107,0.5)",
                  pointerEvents: "none",
                }}
              />
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                <Image
                  src="/images/about-anisha.png"
                  alt="Anisha, licensed esthetician at Smoove Skin Studio"
                  width={600}
                  height={750}
                  className="w-full object-cover rounded-xl"
                  style={{ height: "clamp(420px, 65vh, 720px)", objectPosition: "50% 25%" }}
                />
              </div>
            </div>

            {/* Text */}
            <div ref={textRef} className="about-text">
              <p
                style={{
                  fontFamily: "var(--home-font-serif), serif",
                  fontSize: "1.05rem",
                  fontStyle: "italic",
                  color: "#9A6A4E",
                }}
              >
                Hi, I&apos;m Anisha —
              </p>

              <h2
                className="mt-3 tracking-tight"
                style={{
                  fontFamily: "var(--home-font-serif), serif",
                  fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                  lineHeight: 1.1,
                  fontWeight: 300,
                  color: "#2E1F17",
                }}
              >
                Skin care that{" "}
                <em style={{ color: "#9A6A4E", fontStyle: "italic" }}>actually</em>{" "}
                listens.
              </h2>

              <p className="mt-6 text-base leading-relaxed" style={{ color: "#6B5F54" }}>
                Smoove isn&apos;t a chain. It&apos;s a private, one-on-one experience with an
                esthetician who takes the time to understand your skin — not just your appointment
                slot. Every treatment is customized, every visit intentional.
              </p>

              <hr className="my-8" style={{ borderColor: "rgba(196,165,107,0.35)" }} />

              {/* 2x2 stat blocks */}
              <div className="rounded-2xl p-3 sm:p-4" style={{ backgroundColor: "#FBF7F0" }}>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { value: "3+", label: "Years of Experience" },
                    { value: "100%", label: "Licensed Esthetician" },
                    { value: "Premium", label: "Quality Products" },
                    { value: "Award Winning", label: "Brazilian & Full Body Wax Specialist" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl text-center flex flex-col items-center justify-center"
                      style={{ backgroundColor: "#F0E6D8", padding: "26px 16px", minHeight: 116 }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--home-font-serif), serif",
                          fontSize: "1.45rem",
                          color: "#C8A56B",
                          fontWeight: 500,
                          lineHeight: 1.15,
                        }}
                      >
                        {stat.value}
                      </p>
                      <p className="mt-1.5 text-sm leading-snug" style={{ color: "#6B5F54" }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="my-8" style={{ borderColor: "rgba(196,165,107,0.35)" }} />

              <button
                onClick={() => requestBooking(BOOKING_URL)}
                className="inline-flex items-center gap-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#2E1F17", padding: "14px 28px", border: "none", cursor: "pointer" }}
              >
                Experience Smoove <span>→</span>
              </button>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
