"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const trustPoints = [
  {
    label: "Licensed & Certified",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    label: "Organic & Clean Products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    label: "Private Studio — No Distractions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const trustRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    trustRefs.current.forEach((el) => { if (el) observer.observe(el); });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .about-img {
          opacity: 0;
          transform: translateX(-30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .about-img.in-view {
          opacity: 1;
          transform: translateX(0);
        }
        .about-text {
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.7s ease-out 0.1s, transform 0.7s ease-out 0.1s;
        }
        .about-text.in-view {
          opacity: 1;
          transform: translateX(0);
        }
        .trust-item {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .trust-item.in-view {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <section id="about" ref={sectionRef} className="py-24" style={{ backgroundColor: "#E8DDD1" }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Image */}
            <div ref={imageRef} className="about-img">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/anisha.jpg"
                  alt="Anisha, licensed esthetician at Smoove Skin Studio"
                  width={600}
                  height={750}
                  className="w-full h-[420px] sm:h-[560px] lg:h-[680px] object-cover object-top rounded-2xl"
                />
              </div>
            </div>

            {/* Text */}
            <div ref={textRef} className="about-text">
              {/* Eyebrow */}
              <span
                className="inline-block px-5 py-2 rounded-full bg-white text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]"
              >
                About Anisha
              </span>

              {/* Headline */}
              <h2
                className="mt-6 font-light tracking-tight text-[var(--color-text)]"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  lineHeight: 1.1,
                }}
              >
                Skin Care That Actually{" "}
                <span className="text-[var(--color-primary)] italic">Listens.</span>
              </h2>

              {/* Body */}
              <p className="mt-7 text-base leading-relaxed text-[var(--color-text-light)]">
                Smoove Skin Studio isn&apos;t a chain. It&apos;s a private, one-on-one experience
                with an esthetician who takes the time to understand your skin — not just your
                appointment slot. Every treatment is customized, every visit is intentional.
              </p>

              {/* Trust points */}
              <div className="mt-10 flex flex-col gap-4">
                {trustPoints.map((point, i) => (
                  <div
                    key={point.label}
                    ref={(el) => { trustRefs.current[i] = el; }}
                    className="trust-item flex items-center gap-4"
                    style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-primary)]"
                      style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                    >
                      {point.icon}
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {point.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Link */}
              <a
                href="#"
                className="inline-flex items-center gap-2 mt-10 text-sm font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors"
              >
                Learn More About the Studio
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
