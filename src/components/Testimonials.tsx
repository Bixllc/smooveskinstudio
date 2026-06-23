"use client";

import Image from "next/image";
import { useState } from "react";

const testimonials = [
  {
    quote:
      "Anisha is absolutely amazing. I used to go to a big chain and saw several different people — she is by far the best I've ever been to.",
    name: "Khloe Langston",
    service: "Brazilian Wax",
  },
  {
    quote:
      "Cleanest, most comfortable wax I've ever had. The private studio makes all the difference — I actually look forward to my appointments now.",
    name: "Client Name",
    service: "Full Leg Wax",
  },
  {
    quote:
      "Gentle, fast, and genuinely caring. My brows have never looked better, and I won't trust anyone else with them.",
    name: "Client Name",
    service: "Brow Wax & Tint",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () =>
    setActiveIndex((i) => (i + 1) % testimonials.length);

  const active = testimonials[activeIndex];

  return (
    <section className="testimonials-section" style={{ backgroundColor: "#E5D9C8", padding: "100px 48px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            marginBottom: 48,
            fontFamily: "var(--home-font-serif), serif",
            fontWeight: 500,
            fontSize: "clamp(38px, 3.6vw, 54px)",
            lineHeight: 1.04,
            letterSpacing: "-0.5px",
            color: "#2E1F17",
          }}
        >
          What leaving Smoove feels like
        </h2>

        <div
          className="testimonials-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "0.82fr 1.18fr",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          {/* Image card */}
          <div
            className="relative"
            style={{
              borderRadius: 26,
              overflow: "hidden",
              minHeight: 460,
              boxShadow: "0 30px 64px -34px rgba(58,40,30,0.4)",
            }}
          >
            <Image
              src="/images/testimonials-treatment-2.jpg"
              alt="Esthetician applying treatment oil at Smoove Skin Studio"
              fill
              sizes="(max-width: 900px) 100vw, 40vw"
              className="object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>

          {/* Quote card */}
          <div
            className="flex flex-col"
            style={{
              backgroundColor: "#F4EDE2",
              borderRadius: 26,
              padding: "54px clamp(36px, 4vw, 60px)",
              boxShadow: "0 30px 64px -34px rgba(58,40,30,0.32)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--home-font-serif), serif",
                fontWeight: 600,
                fontSize: 96,
                lineHeight: 0.5,
                height: 52,
                color: "#2E1F17",
                display: "block",
              }}
            >
              &ldquo;
            </span>

            <p
              style={{
                flex: 1,
                marginTop: 26,
                fontFamily: "var(--home-font-serif), serif",
                fontWeight: 500,
                fontSize: "clamp(22px, 2.1vw, 31px)",
                lineHeight: 1.4,
                color: "#2E1F17",
              }}
            >
              {active.quote}
            </p>

            <div style={{ color: "#2E1F17", fontSize: 15, letterSpacing: "3px", marginTop: 30 }}>
              ★★★★★
            </div>

            <p
              style={{
                marginTop: 18,
                fontFamily: "var(--home-font-sans), sans-serif",
                fontWeight: 300,
                fontSize: 14,
                letterSpacing: "0.3px",
                color: "#3A281E",
              }}
            >
              — {active.name} · {active.service}
            </p>

            <div style={{ borderTop: "1px solid rgba(154,106,78,0.25)", margin: "30px 0 24px" }} />

            <div style={{ display: "flex", gap: 14 }}>
              <button
                onClick={prev}
                className="testimonial-nav-btn testimonial-prev-btn"
                aria-label="Previous testimonial"
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  border: "1px solid rgba(58,40,30,0.2)",
                  background: "#FBF7F0",
                  fontSize: 18,
                  color: "#2E1F17",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "150ms ease",
                }}
              >
                ←
              </button>
              <button
                onClick={next}
                className="testimonial-nav-btn testimonial-next-btn"
                aria-label="Next testimonial"
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  border: "1px solid rgba(58,40,30,0.2)",
                  background: "#FBF7F0",
                  fontSize: 18,
                  color: "#2E1F17",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "150ms ease",
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .testimonial-nav-btn:hover {
          background: #3A281E !important;
          color: #F4EDE2 !important;
          border-color: #3A281E !important;
        }
        @media (max-width: 900px) {
          .testimonials-grid {
            grid-template-columns: 1fr !important;
          }
          .testimonial-next-btn {
            background: #2E1F17 !important;
            color: #F4EDE2 !important;
            border-color: #2E1F17 !important;
          }
          .testimonial-next-btn:hover {
            background: #3A281E !important;
            color: #F4EDE2 !important;
          }
        }
        @media (max-width: 600px) {
          .testimonials-section { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}
