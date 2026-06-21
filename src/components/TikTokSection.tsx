"use client";

const TIKTOK_URL = "https://www.tiktok.com/@smooveskinstudio";
const VIDEO_COUNT = 4;

export default function TikTokSection() {
  return (
    <section style={{ backgroundColor: "#2E1F17", padding: "100px 48px" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 28,
            flexWrap: "wrap",
            marginBottom: 52,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--home-font-serif), serif",
              fontWeight: 500,
              fontSize: "clamp(38px, 3.6vw, 54px)",
              lineHeight: 1.04,
              letterSpacing: "-0.5px",
              color: "#F4EDE2",
            }}
          >
            Life at Smoove
          </h2>

          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Smoove Skin Studio on TikTok"
            className="tiktok-icon-link"
            style={{
              width: 46,
              height: 46,
              flexShrink: 0,
              borderRadius: "50%",
              backgroundColor: "rgba(244,237,226,0.1)",
              border: "1px solid rgba(200,165,107,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 18 20" fill="#F4EDE2">
              <path d="M9.37 0C10.15 0 10.93.01 11.71 0c.07 1.13.49 2.3 1.33 3.1.84.82 2.01 1.2 3.14 1.35v3.07c-1.07-.04-2.14-.27-3.1-.72-.42-.2-.81-.45-1.18-.73-.01 2.37.01 4.74-.02 7.1-.06 1.14-.43 2.27-1.1 3.2a6.28 6.28 0 01-4.86 2.63c-1.22.06-2.45-.27-3.48-.91a6.24 6.24 0 01-2.76-4.67c-.02-.47-.02-.93.02-1.39.17-1.38.82-2.68 1.82-3.63a6.14 6.14 0 014.55-1.81c.02 1.14-.03 2.27-.03 3.41a2.91 2.91 0 00-2.38.56c-.6.44-1 1.11-1.12 1.83-.09.52-.01 1.08.24 1.54.43.83 1.33 1.38 2.28 1.37.94.01 1.85-.52 2.32-1.32.16-.26.28-.56.31-.87.08-1.16.05-2.32.06-3.49 0-3.28-.01-6.55 0-9.83z" />
            </svg>
          </a>
        </div>

        {/* TODO: Replace placeholder cards with real video/thumbnail content */}
        <div className="tiktok-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
          {Array.from({ length: VIDEO_COUNT }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className="relative"
              style={{
                aspectRatio: "9 / 16",
                borderRadius: 20,
                overflow: "hidden",
                background:
                  "repeating-linear-gradient(135deg, #3A2A20 0 14px, #34251C 14px 28px)",
              }}
            >
              <div
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "rgba(244,237,226,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    marginLeft: 4,
                    borderTop: "9px solid transparent",
                    borderBottom: "9px solid transparent",
                    borderLeft: "14px solid #2E1F17",
                  }}
                />
              </div>

              <span
                className="absolute"
                style={{
                  left: 14,
                  bottom: 14,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10.5,
                  letterSpacing: "1px",
                  color: "#C8B7A8",
                }}
              >
                VIDEO 0{n}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .tiktok-icon-link:hover { background-color: rgba(244,237,226,0.2) !important; }
        @media (max-width: 900px) {
          .tiktok-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
