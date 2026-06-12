"use client";

const brands = [
  {
    badge: "BUSHBALM",
    offer: "15% off your first order",
    description: "Ingrown-hair serums & aftercare oils, exclusive to Smoove clients.",
  },
  {
    badge: "GIGI WAX",
    offer: "Free wax warmer",
    description: "With any product purchase of $50 or more. While supplies last.",
  },
  {
    badge: "FINIPIL",
    offer: "Buy 2, get 1 free",
    description: "Antiseptic aftercare lotions — exclusive to Smoove clients.",
  },
];

export default function CommunityPartners() {
  return (
    <section className="py-24" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <h2
          className="text-center mb-14"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 300,
            color: "#2E1F17",
            lineHeight: 1.2,
          }}
        >
          Brands we trust. Deals just for you.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.badge}
              className="bg-white rounded-2xl p-8 flex flex-col"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <div
                className="inline-flex items-center px-4 py-1.5 rounded-full self-start text-xs font-medium tracking-widest uppercase mb-6"
                style={{ border: "1.5px dashed #C4A882", color: "#9A6A4E" }}
              >
                {brand.badge}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.5rem",
                  fontWeight: 300,
                  color: "#2E1F17",
                  lineHeight: 1.2,
                }}
              >
                {brand.offer}
              </h3>

              <p className="mt-3 text-sm leading-relaxed flex-1" style={{ color: "#6B5F54" }}>
                {brand.description}
              </p>

              <a
                href="#"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "#9A6A4E" }}
              >
                Claim offer <span>→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
