"use client";

import Script from "next/script";

const TIKTOK_URL = "https://www.tiktok.com/@smooveskinstudio";

// Most recent 3 posts, pulled live from the account on 2026-06-21.
const VIDEO_IDS = [
  "7652781243171458335",
  "7650601733856529694",
  "7647682881732578591",
];

export default function TikTokSection() {
  return (
    <section className="py-24" style={{ backgroundColor: "#2E1A0E" }}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <h2
          className="mb-4"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 300,
            color: "#FAF8F5",
            lineHeight: 1.1,
          }}
        >
          Life at Smoove
        </h2>

        {/* TikTok badge */}
        <a
          href={TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-12 inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          aria-label="TikTok"
        >
          <svg width="14" height="16" viewBox="0 0 18 20" fill="white">
            <path d="M9.37 0C10.15 0 10.93.01 11.71 0c.07 1.13.49 2.3 1.33 3.1.84.82 2.01 1.2 3.14 1.35v3.07c-1.07-.04-2.14-.27-3.1-.72-.42-.2-.81-.45-1.18-.73-.01 2.37.01 4.74-.02 7.1-.06 1.14-.43 2.27-1.1 3.2a6.28 6.28 0 01-4.86 2.63c-1.22.06-2.45-.27-3.48-.91a6.24 6.24 0 01-2.76-4.67c-.02-.47-.02-.93.02-1.39.17-1.38.82-2.68 1.82-3.63a6.14 6.14 0 014.55-1.81c.02 1.14-.03 2.27-.03 3.41a2.91 2.91 0 00-2.38.56c-.6.44-1 1.11-1.12 1.83-.09.52-.01 1.08.24 1.54.43.83 1.33 1.38 2.28 1.37.94.01 1.85-.52 2.32-1.32.16-.26.28-.56.31-.87.08-1.16.05-2.32.06-3.49 0-3.28-.01-6.55 0-9.83z" />
          </svg>
        </a>

        {/* Live TikTok embeds — official widget, not re-hosted video files */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIDEO_IDS.map((id) => (
            <blockquote
              key={id}
              className="tiktok-embed"
              cite={`${TIKTOK_URL}/video/${id}`}
              data-video-id={id}
              style={{ maxWidth: "100%", minWidth: 0, margin: 0 }}
            >
              <section></section>
            </blockquote>
          ))}
        </div>
      </div>

      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </section>
  );
}
