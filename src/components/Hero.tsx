"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero-waxing.png",
    alt: "Anisha performing a waxing treatment at Smoove Skin Studio",
  },
  {
    src: "/images/hero-facial.png",
    alt: "Anisha performing a facial treatment at Smoove Skin Studio",
  },
  {
    src: "/images/hero-studio.png",
    alt: "Treatment room at Smoove Skin Studio — gold waxing bed and neon sign",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  // Auto-advance every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="pt-16 md:pt-20 min-h-screen flex items-center">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 py-10 md:py-15 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-15 items-center max-lg:text-center">

        {/* Content */}
        <div>
          <h1 className="font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[var(--color-text)]">
            <span className="block">Smoove</span>
            <span className="block text-[var(--color-primary)] italic">Skin</span>
            <span className="block">Studio</span>
          </h1>

          <p className="mt-5 md:mt-7 text-[0.95rem] md:text-[1.05rem] font-light leading-[1.7] text-[var(--color-text-light)] max-w-[460px] max-lg:mx-auto">
            Get waxed by an award-winning specialist with precision, care, and
            results you can feel. At Smoove Skin Studio, every service is
            designed to leave your skin smoother, cleaner, and more confident
            than ever.
          </p>

          <p className="mt-5 text-sm font-bold tracking-wider text-[var(--color-primary-dark)] uppercase">
            Full Body Brazilian Waxing in the DFW Area
          </p>

          <div className="mt-10 flex gap-4 flex-wrap max-lg:justify-center">
            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border-[1.5px] border-[var(--color-primary)] text-[var(--color-primary)] text-[0.938rem] font-medium tracking-[0.01em] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              Explore Services
            </a>
          </div>
        </div>

        {/* Image slider */}
        <div className="relative max-lg:max-w-[500px] max-lg:mx-auto">
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            {slides.map((slide, i) => (
              <div
                key={slide.src}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === current ? 1 : 0 }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "20px" : "8px",
                  height: "8px",
                  backgroundColor:
                    i === current
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
