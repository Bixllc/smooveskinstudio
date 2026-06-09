import Image from "next/image";

const items = [
  "As Seen On TikTok",
  "Watauga's Favorite Studio",
  "Organic Products Only",
  "Private 1-on-1 Sessions",
  "Trusted by 200+ Clients",
  "Licensed & Certified Esthetician",
  "Clean Beauty Always",
];

const partners = [
  { name: "BushBalm Pro", logo: "/images/partners/bushbalm.png" },
  { name: "Honeycomb Wax", logo: "/images/partners/honeycombwax.png" },
  { name: "Indulge Wax", logo: "/images/partners/indulgewax.png" },
  { name: "NovaWax", logo: "/images/partners/novawax.jpg" },
  { name: "Tress Wellness", logo: "/images/partners/tresswellness.png" },
  { name: "Wax Wax", logo: "/images/partners/waxwax.png" },
];

export default function RevealMarquee() {
  return (
    <div
      className="relative z-10 bg-[var(--color-bg)] overflow-hidden"
      style={{
        borderRadius: "32px 32px 0 0",
        marginTop: "-40px",
        paddingTop: "28px",
        paddingBottom: "32px",
      }}
    >
      {/* Fade masks — cover both rows */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20"
        style={{ background: "linear-gradient(to right, var(--color-bg), transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20"
        style={{ background: "linear-gradient(to left, var(--color-bg), transparent)" }}
      />

      {/* Row 1 — Text marquee */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee-homepage flex items-center gap-0">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="flex items-center whitespace-nowrap"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontVariant: "small-caps",
                letterSpacing: "0.12em",
                color: "var(--color-text-light)",
                padding: "0 2rem",
              }}
            >
              <span style={{ color: "var(--color-primary)", marginRight: "2rem" }}>✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-auto mt-6 mb-6"
        style={{
          height: "1px",
          backgroundColor: "var(--color-border)",
          width: "calc(100% - 80px)",
          opacity: 0.6,
        }}
      />

      {/* Row 2 — Partner logos */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee-homepage flex items-center gap-0">
          {[...partners, ...partners].map((partner, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center"
              style={{ padding: "0 40px", height: "48px" }}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={100}
                height={40}
                className="max-h-[36px] w-auto object-contain"
                style={{ opacity: 0.55, filter: "grayscale(100%)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
