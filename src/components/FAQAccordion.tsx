"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    q: "Do I need to book in advance?",
    a: "Yes, booking at least 48 hours ahead is recommended to secure your preferred time. Same-day appointments are occasionally available — check availability online.",
  },
  {
    q: "What should I expect during my first visit?",
    a: "Your first session starts with a quick skin consultation so Anisha can customize your treatment on the day. Plan to arrive a few minutes early.",
  },
  {
    q: "What products are used?",
    a: "Only clean, organic products are used in the studio. No harsh chemicals, no synthetic fragrances.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancellations must be made at least 24 hours in advance to avoid a late cancellation fee.",
    // TODO: Pull from BusinessSettings.cancellationPolicy when available
  },
  {
    q: "How long are sessions?",
    a: "Session lengths vary by service. Check the Services section or your booking confirmation for exact durations.",
  },
];

export default function FAQAccordion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
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

  const toggle = (i: number) =>
    setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="py-24 bg-[var(--color-bg-light)]">
      <div className="max-w-[800px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-5 py-2 rounded-full bg-white text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
            Questions
          </span>
          <h2
            className="mt-6 font-light tracking-tight text-[var(--color-text)]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              lineHeight: 1.1,
            }}
          >
            We&apos;ve Got You{" "}
            <span className="text-[var(--color-primary)] italic">Covered.</span>
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-light)] leading-relaxed">
            Everything you&apos;d want to know before your first visit.
          </p>
        </div>

        {/* Accordion */}
        <div
          ref={containerRef}
          className="flex flex-col gap-3"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left"
                >
                  <span
                    className="font-medium pr-4 transition-colors duration-200"
                    style={{
                      fontSize: "0.95rem",
                      color: isOpen
                        ? "var(--color-primary-dark)"
                        : "var(--color-text)",
                    }}
                  >
                    {faq.q}
                  </span>
                  {/* Chevron — rotates 180° when open. Not text-decoration. */}
                  <span
                    className="flex-shrink-0 text-[var(--color-primary)] transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>

                {/* CSS max-height transition — no JS height calculation */}
                <div
                  style={{
                    maxHeight: isOpen ? "200px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.35s ease",
                  }}
                >
                  <p className="px-7 pb-6 text-sm text-[var(--color-text-light)] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
