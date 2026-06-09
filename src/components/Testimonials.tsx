"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Khloe Langston",
    service: "Brazilian Wax",
    text: "Anisha is absolutely amazing! I used to go to European wax and saw several different people and she is by far the best!",
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
    text: "She's the best! I've noticed a major difference right away compared to other waxing businesses. The owner really cares about your skin. Ever since going here I've seen no ingrown.",
  },
  {
    name: "Ebony Porter",
    service: "Waxing",
    text: "Anisha was very great at making you feel comfortable during the process!",
  },
  {
    name: "Phylicia Durman",
    service: "Skin Treatment",
    text: "Overall quick and great service.",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () =>
    setActiveIndex((i) => (i + 1) % testimonials.length);

  return (
    <section id="reviews" className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-[900px] mx-auto px-6 md:px-10">
        {/* Wordplay heading */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-bg-light)] text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
            Testimonials
          </span>
          <h2
            className="mt-6 font-light tracking-tight text-[var(--color-text)]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
              lineHeight: 1.2,
            }}
          >
            What Leaving Smoo
            {/* "the" with hand-drawn SVG brush stroke — not CSS text-decoration */}
            <span className="relative inline-block">
              the
              <svg
                aria-hidden="true"
                viewBox="0 0 48 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "-2px",
                  width: "calc(100% + 4px)",
                  height: "14px",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <path
                  d="M2,8 C6,4 11,11 17,7 C22,3 27,10 33,7 C38,4 42,9 46,6"
                  stroke="#C4A882"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
            ve Skin Studio Feels Like
          </h2>
        </div>

        {/* Card */}
        <div
          ref={sectionRef}
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm min-h-[220px] flex flex-col justify-between">
            <p
              className="text-[var(--color-text-light)] leading-relaxed italic"
              style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)" }}
            >
              &ldquo;{testimonials[activeIndex].text}&rdquo;
            </p>
            <div className="mt-8 flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {testimonials[activeIndex].name}
                </p>
                <p className="text-sm text-[var(--color-text-light)] mt-0.5">
                  {testimonials[activeIndex].service}
                </p>
              </div>
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              aria-label="Previous"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? "20px" : "8px",
                    height: "8px",
                    backgroundColor:
                      i === activeIndex
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              aria-label="Next"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
