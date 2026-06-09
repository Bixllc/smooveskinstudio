"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const credentials = [
  "Licensed Esthetician",
  "Clean Beauty Specialist",
  "Private Studio Owner",
];

export default function MeetAnisha({ clientSlug }: { clientSlug: string }) {
  const textRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);

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

    if (textRef.current) observer.observe(textRef.current);
    if (photoRef.current) observer.observe(photoRef.current);
    pillRefs.current.forEach((el) => { if (el) observer.observe(el); });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .meet-text {
          opacity: 0;
          transform: translateX(-30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .meet-text.in-view {
          opacity: 1;
          transform: translateX(0);
        }
        .meet-photo {
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.7s ease-out 0.15s, transform 0.7s ease-out 0.15s;
        }
        .meet-photo.in-view {
          opacity: 1;
          transform: translateX(0);
        }
        .meet-pill {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        }
        .meet-pill.in-view {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <section className="py-24 bg-[var(--color-bg-light)]">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text — left */}
            <div ref={textRef} className="meet-text">
              <span className="inline-block px-5 py-2 rounded-full bg-white text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
                Your Esthetician
              </span>

              <h2
                className="mt-6 font-light tracking-tight text-[var(--color-text)]"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  lineHeight: 1.1,
                }}
              >
                Meet{" "}
                <span className="text-[var(--color-primary)] italic">Anisha.</span>
              </h2>

              <p className="mt-7 text-base leading-relaxed text-[var(--color-text-light)]">
                Anisha is a licensed esthetician and the sole practitioner at
                Smoove Skin Studio. Every client gets her full attention — no
                handoffs, no rushing. Just skilled, personalized care in a space
                she built with you in mind.
              </p>

              {/* Credential pills */}
              <div className="mt-8 flex flex-wrap gap-3">
                {credentials.map((cred, i) => (
                  <span
                    key={cred}
                    ref={(el) => { pillRefs.current[i] = el; }}
                    className="meet-pill inline-block px-4 py-2 rounded-full text-sm font-medium text-[var(--color-primary-dark)] border border-[var(--color-primary)]"
                    style={{
                      transitionDelay: `${0.35 + i * 0.08}s`,
                      backgroundColor: "rgba(196,168,130,0.08)",
                    }}
                  >
                    {cred}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <a
                href={`/${clientSlug}/book`}
                className="inline-flex items-center gap-2 mt-10 text-sm font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors"
              >
                Book With Anisha
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            {/* Photo — right */}
            <div ref={photoRef} className="meet-photo flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[420px]"
                style={{
                  borderRadius: "24px",
                  boxShadow: "0 24px 60px rgba(196,168,130,0.18)",
                }}
              >
                {/* TODO: Replace with real image — Anisha portrait */}
                <Image
                  src="/images/anisha-2.jpg"
                  alt="Anisha — licensed esthetician at Smoove Skin Studio"
                  width={420}
                  height={560}
                  className="w-full object-cover object-top"
                  style={{ borderRadius: "24px", aspectRatio: "3/4" }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
