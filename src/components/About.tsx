"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const BOOKING_URL = "https://smooveskin.as.me/schedule/64a2c692";

export default function About() {
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

              {/* Numbered stats */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { num: "01", text: "Licensed & certified esthetician" },
                  { num: "02", text: "Organic & clean products only" },
                  { num: "03", text: "Private studio, no distractions" },
                ].map((stat) => (
                  <div key={stat.num}>
                    <p
                      style={{
                        fontFamily: "var(--home-font-serif), serif",
                        fontSize: "1.4rem",
                        color: "#C4A56B",
                        fontWeight: 400,
                      }}
                    >
                      {stat.num}
                    </p>
                    <p className="mt-2 text-sm leading-snug" style={{ color: "#6B5F54" }}>
                      {stat.text}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="my-8" style={{ borderColor: "rgba(196,165,107,0.35)" }} />

              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#2E1F17", padding: "14px 28px" }}
              >
                Experience Smoove <span>→</span>
              </a>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
