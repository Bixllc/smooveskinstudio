"use client";

import { useEffect, useRef } from "react";

const TIKTOK_URL = "https://www.tiktok.com/@smooveskinstudio";

// TODO: Replace with live TikTok embeds
const placeholderVideos = [1, 2, 3, 4, 5, 6];

function VideoCard({ index }: { index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
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

  return (
    <a
      ref={ref}
      href={TIKTOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative rounded-2xl overflow-hidden block"
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: `opacity 0.5s ease-out ${(index % 3) * 0.08}s, transform 0.5s ease-out ${(index % 3) * 0.08}s`,
        aspectRatio: "9/16",
        backgroundColor: "#1a1614",
      }}
    >
      {/* Play icon */}
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <svg
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 2l16 9-16 9V2z" />
          </svg>
        </div>
      </div>

      {/* TikTok label */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <svg width="12" height="14" viewBox="0 0 18 20" fill="white" opacity="0.7">
          <path d="M9.37 0C10.15 0 10.93.01 11.71 0c.07 1.13.49 2.3 1.33 3.1.84.82 2.01 1.2 3.14 1.35v3.07c-1.07-.04-2.14-.27-3.1-.72-.42-.2-.81-.45-1.18-.73-.01 2.37.01 4.74-.02 7.1-.06 1.14-.43 2.27-1.1 3.2a6.28 6.28 0 01-4.86 2.63c-1.22.06-2.45-.27-3.48-.91a6.24 6.24 0 01-2.76-4.67c-.02-.47-.02-.93.02-1.39.17-1.38.82-2.68 1.82-3.63a6.14 6.14 0 014.55-1.81c.02 1.14-.03 2.27-.03 3.41a2.91 2.91 0 00-2.38.56c-.6.44-1 1.11-1.12 1.83-.09.52-.01 1.08.24 1.54.43.83 1.33 1.38 2.28 1.37.94.01 1.85-.52 2.32-1.32.16-.26.28-.56.31-.87.08-1.16.05-2.32.06-3.49 0-3.28-.01-6.55 0-9.83z" />
        </svg>
        <span className="text-white/70 text-xs">@smooveskinstudio</span>
      </div>
    </a>
  );
}

export default function TikTokSection() {
  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-bg-light)] text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
            Life at Smoove
          </span>
          <h2
            className="mt-6 font-light tracking-tight text-[var(--color-text)]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              lineHeight: 1.1,
            }}
          >
            Follow the{" "}
            <span className="text-[var(--color-primary)] italic">Journey.</span>
          </h2>
          <p className="mt-4 text-sm text-[var(--color-text-light)] tracking-wide">
            Find us{" "}
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors font-medium"
            >
              @smooveskinstudio
            </a>{" "}
            on TikTok
          </p>
        </div>

        {/* Grid: 3 col desktop, 2 col tablet, 1 col mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {placeholderVideos.map((_, i) => (
            <VideoCard key={i} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: "#000000" }}
          >
            <svg width="14" height="16" viewBox="0 0 18 20" fill="white">
              <path d="M9.37 0C10.15 0 10.93.01 11.71 0c.07 1.13.49 2.3 1.33 3.1.84.82 2.01 1.2 3.14 1.35v3.07c-1.07-.04-2.14-.27-3.1-.72-.42-.2-.81-.45-1.18-.73-.01 2.37.01 4.74-.02 7.1-.06 1.14-.43 2.27-1.1 3.2a6.28 6.28 0 01-4.86 2.63c-1.22.06-2.45-.27-3.48-.91a6.24 6.24 0 01-2.76-4.67c-.02-.47-.02-.93.02-1.39.17-1.38.82-2.68 1.82-3.63a6.14 6.14 0 014.55-1.81c.02 1.14-.03 2.27-.03 3.41a2.91 2.91 0 00-2.38.56c-.6.44-1 1.11-1.12 1.83-.09.52-.01 1.08.24 1.54.43.83 1.33 1.38 2.28 1.37.94.01 1.85-.52 2.32-1.32.16-.26.28-.56.31-.87.08-1.16.05-2.32.06-3.49 0-3.28-.01-6.55 0-9.83z" />
            </svg>
            Follow on TikTok
          </a>
        </div>
      </div>
    </section>
  );
}
