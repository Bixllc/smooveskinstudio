"use client";

import Image from "next/image";
import { useState } from "react";

const testimonials = [
  {
    name: "Khloe Langston",
    service: "Brazilian Wax",
    text: "Anisha is absolutely amazing. I used to go to a big chain and saw several different people — she is by far the best I've ever been to.",
  },
  {
    name: "Lyndsey",
    service: "Full Body Wax",
    text: "Anisha has amazing customer service. Her space was really clean and organized. She made me feel very comfortable in her space. Truly glad I found her.",
  },
  {
    name: "Mikala",
    service: "Brazilian Wax",
    text: "Anisha is truly everything. She took her time and didn't leave no hair behind. Ladies, Anisha is the truth and she has found herself a forever client!",
  },
  {
    name: "Nakeisha Sealey",
    service: "Waxing",
    text: "She's the best! I've noticed a major difference right away compared to other waxing businesses. The owner really cares about your skin.",
  },
  {
    name: "Ebony Porter",
    service: "Waxing",
    text: "Anisha was very great at making you feel comfortable during the process!",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () =>
    setActiveIndex((i) => (i + 1) % testimonials.length);

  return (
    <section id="reviews" className="py-24" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">

        <h2
          className="text-center mb-14"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 300,
            color: "#2E1F17",
            lineHeight: 1.1,
          }}
        >
          What leaving Smoove feels like
        </h2>

        {/* Two-col card */}
        <div
          className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-[2fr_3fr]"
          style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}
        >
          {/* Photo */}
          <div className="relative hidden lg:block" style={{ minHeight: "500px" }}>
            <Image
              src="/images/anisha-3.jpg"
              alt="Anisha performing a treatment at Smoove Skin Studio"
              fill
              className="object-cover object-top"
            />
          </div>

          {/* Quote */}
          <div
            className="p-10 md:p-14 flex flex-col justify-between"
            style={{ backgroundColor: "#F5F0EB" }}
          >
            <div>
              <span
                style={{
                  fontSize: "3.5rem",
                  lineHeight: 1,
                  color: "#2E1F17",
                  fontFamily: "var(--font-heading)",
                  display: "block",
                }}
              >
                &ldquo;
              </span>
              <p
                className="mt-4 leading-relaxed"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.15rem, 2.2vw, 1.5rem)",
                  color: "#2E1F17",
                  fontWeight: 300,
                }}
              >
                {testimonials[activeIndex].text}
              </p>
            </div>

            <div className="mt-10">
              <div style={{ color: "#C4A56B", fontSize: "1.1rem", letterSpacing: "3px" }}>
                ★★★★★
              </div>
              <p className="mt-3 text-sm" style={{ color: "#6B5F54" }}>
                — {testimonials[activeIndex].name} · {testimonials[activeIndex].service}
              </p>

              <hr className="my-6" style={{ borderColor: "#D9D0C5" }} />

              <div className="flex items-center gap-3">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border flex items-center justify-center text-sm transition-all hover:border-[#2E1F17]"
                  style={{ borderColor: "#D9D0C5", color: "#6B5F54" }}
                  aria-label="Previous testimonial"
                >
                  ←
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border flex items-center justify-center text-sm transition-all hover:border-[#2E1F17]"
                  style={{ borderColor: "#D9D0C5", color: "#6B5F54" }}
                  aria-label="Next testimonial"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
