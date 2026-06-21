"use client";

import Image from "next/image";

type Brand = {
  badge: string;
  logo?: string;
  offer: string;
  description?: string;
  code?: string;
  href: string;
  secondaryLink?: { label: string; href: string };
};

const brands: Brand[] = [
  {
    badge: "BUSHBALM",
    logo: "/images/brand-bushbalm.png",
    offer: "15% off your first order",
    description: "Ingrown-hair serums & aftercare oils, exclusive to Smoove clients.",
    code: "SMOOVE15",
    href: "https://bushbalm.superfiliate.com/SMOOVESKIN",
    secondaryLink: { label: "For Estheticians", href: "https://pros.bushbalm.com/?ll_ref_id=5ogyvV0SO" },
  },
  {
    badge: "HONEYCOMB WAX CO",
    offer: "10% off",
    description: "Professional hard wax, soft wax, roll-on wax & warmers for waxing services.",
    code: "SSS10",
    href: "https://honeycombwaxco.com/?ref=AnishaD&utm_source=affiliate",
  },
  {
    badge: "FINIPIL",
    offer: "Buy 2, get 1 free",
    description: "Antiseptic aftercare lotions — exclusive to Smoove clients.",
    code: "SMOOVEFINI",
    href: "#",
  },
  {
    badge: "AMAZON",
    offer: "Shop my Amazon storefront",
    href: "https://www.amazon.com/shop/smooveskinstudio?ref_=cm_sw_r_cp_ud_aipsfshop_aipsfsmooveskinstudio_HTP46TANJXPEVDHMT6A0&ccs_id=6c015a63-a867-43c0-bbdb-f8d84a4d74d2",
  },
];

export default function CommunityPartners() {
  return (
    <section style={{ backgroundColor: "#F4EDE2", padding: "100px 48px" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            maxWidth: 640,
            margin: "0 auto 60px",
            fontFamily: "var(--home-font-serif), serif",
            fontWeight: 500,
            fontSize: "clamp(38px, 3.6vw, 54px)",
            lineHeight: 1.04,
            letterSpacing: "-0.5px",
            color: "#2E1F17",
          }}
        >
          Brands we trust. Deals just for you.
        </h2>

        <div className="deals-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 26 }}>
          {brands.map((brand) => (
            <div
              key={brand.badge}
              style={{
                backgroundColor: "#FBF7F0",
                borderRadius: 24,
                padding: "38px 32px",
                border: "1px solid rgba(154,106,78,0.16)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Real logo when available, dashed placeholder otherwise */}
              {brand.logo ? (
                <div
                  className="relative"
                  style={{ height: 48, width: 130, alignSelf: "center" }}
                >
                  <Image
                    src={brand.logo}
                    alt={brand.badge}
                    fill
                    sizes="130px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 48,
                    width: 130,
                    alignSelf: "center",
                    border: "1.5px dashed rgba(110,78,59,0.4)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 11,
                    letterSpacing: "2px",
                    color: "#9A6A4E",
                  }}
                >
                  {brand.badge}
                </div>
              )}

              <h3
                style={{
                  fontFamily: "var(--home-font-serif), serif",
                  fontWeight: 600,
                  fontSize: 25,
                  lineHeight: 1.2,
                  color: "#2E1F17",
                }}
              >
                {brand.offer}
              </h3>

              <p
                style={{
                  flex: 1,
                  fontFamily: "var(--home-font-sans), sans-serif",
                  fontWeight: 300,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "#6A5447",
                }}
              >
                {brand.description}
              </p>

              {brand.code && (
                <p
                  style={{
                    fontFamily: "var(--home-font-sans), sans-serif",
                    fontWeight: 300,
                    fontSize: 13,
                    letterSpacing: "0.3px",
                    color: "#6A5447",
                  }}
                >
                  Code:{" "}
                  <span
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: 12.5,
                      letterSpacing: "1px",
                      color: "#9A6A4E",
                    }}
                  >
                    {brand.code}
                  </span>
                </p>
              )}

              <a
                href={brand.href}
                target="_blank"
                rel="noopener noreferrer"
                className="deal-claim-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--home-font-sans), sans-serif",
                  fontWeight: 300,
                  fontSize: 13.5,
                  letterSpacing: "0.4px",
                  color: "#2E1F17",
                  textDecoration: "none",
                  transition: "color 150ms ease",
                }}
              >
                Claim offer <span style={{ fontSize: 15 }}>→</span>
              </a>

              {brand.secondaryLink && (
                <a
                  href={brand.secondaryLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="deal-claim-link"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: -8,
                    fontFamily: "var(--home-font-sans), sans-serif",
                    fontWeight: 300,
                    fontSize: 12,
                    letterSpacing: "0.4px",
                    color: "#6A5447",
                    textDecoration: "none",
                    transition: "color 150ms ease",
                  }}
                >
                  {brand.secondaryLink.label} <span style={{ fontSize: 13 }}>→</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .deal-claim-link:hover { color: #9A6A4E !important; }
        @media (max-width: 900px) {
          .deals-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .deals-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
