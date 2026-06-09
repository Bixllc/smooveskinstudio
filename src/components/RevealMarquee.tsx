import Image from "next/image";

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
      className="relative z-10 overflow-hidden"
      style={{
        borderRadius: "32px 32px 0 0",
        marginTop: "-40px",
        paddingTop: "32px",
        paddingBottom: "32px",
        backgroundColor: "#1C1814",
      }}
    >
      {/* Fade masks */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20"
        style={{ background: "linear-gradient(to right, #1C1814, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20"
        style={{ background: "linear-gradient(to left, #1C1814, transparent)" }}
      />

      {/* Partner logos */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee-homepage flex items-center gap-0">
          {[...partners, ...partners].map((partner, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center"
              style={{ padding: "0 48px", height: "52px" }}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={110}
                height={44}
                className="max-h-[40px] w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
