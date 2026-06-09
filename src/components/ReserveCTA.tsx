"use client";

import { useEffect, useRef } from "react";

export default function ReserveCTA({ clientSlug }: { clientSlug: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parallax — desktop only
  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const isMobile = () => window.innerWidth < 768;

    const onScroll = () => {
      if (isMobile()) return;
      const rect = section.getBoundingClientRect();
      const offset = -rect.top * 0.4; // 60% scroll speed = moves 40% less
      bg.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fade in content on scroll entry
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: "520px" }}
    >
      {/* Background image with parallax */}
      {/* TODO: Replace with real image — studio/CTA background */}
      <div
        ref={bgRef}
        className="absolute inset-[-15%] bg-center bg-cover will-change-transform"
        style={{
          backgroundImage: "url('/images/studio.jpg')",
          backgroundColor: "#1a1614",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/52" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[520px] px-6 text-center">
        <div
          ref={contentRef}
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          {/* Eyebrow */}
          <p
            className="text-white/65 tracking-widest uppercase font-medium"
            style={{ fontSize: "0.78rem" }}
          >
            Reserve Your Session
          </p>

          {/* Headline */}
          <h2
            className="mt-5 font-light text-white"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            The Best Skin Day{" "}
            <span className="italic" style={{ color: "var(--color-primary)" }}>
              Starts Here.
            </span>
          </h2>

          {/* Subtext */}
          <p
            className="mt-5 text-white/70 font-light leading-relaxed mx-auto"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
              maxWidth: "480px",
            }}
          >
            Your room is private. Your session is personalized. Book in under 2
            minutes.
          </p>

          {/* CTA */}
          <a
            href={`/${clientSlug}/book`}
            className="inline-flex items-center justify-center mt-9 px-10 py-4 rounded-full text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-90 hover:scale-[1.03]"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
              boxShadow: "0 8px 28px rgba(0,0,0,0.30)",
            }}
          >
            Begin Your Ritual
          </a>
        </div>
      </div>
    </section>
  );
}
