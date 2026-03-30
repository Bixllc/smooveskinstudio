import Image from "next/image";

const partners = [
  { name: "BushBalm Pro", logo: "/images/partners/bushbalm.png" },
  {
    name: "Honeycomb Wax",
    textLogo: true,
    style: "font-medium text-xl",
    sub: "WAX COMPANY",
  },
  {
    name: "Indulge Wax",
    textLogo: true,
    customRender: "indulgewax",
  },
  { name: "NovaWax", logo: "/images/partners/novawax.jpg" },
  { name: "Tress Wellness", logo: "/images/partners/tresswellness.png" },
  {
    name: "Wax Wax",
    textLogo: true,
    style: "font-bold text-2xl tracking-tight leading-none",
    stacked: true,
  },
];

function PartnerCard({ partner }: { partner: (typeof partners)[number] }) {
  if ("textLogo" in partner && partner.textLogo) {
    // Indulge Wax - red background with white serif text
    if ("customRender" in partner && partner.customRender === "indulgewax") {
      return (
        <div className="flex-shrink-0 w-[200px] h-[100px] bg-white rounded-2xl shadow-sm flex items-center justify-center px-4">
          <div className="bg-[#B22222] rounded-lg px-4 py-2">
            <span className="text-white font-bold text-lg italic tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
              indulgewax
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-shrink-0 w-[200px] h-[100px] bg-white rounded-2xl shadow-sm flex items-center justify-center px-6">
        {"stacked" in partner && partner.stacked ? (
          <div className="text-center">
            <span className={`block ${partner.style} text-[var(--color-text)]`}>
              wáx
            </span>
            <span className={`block ${partner.style} text-[var(--color-text)]`}>
              wax
            </span>
          </div>
        ) : (
          <div className="text-center">
            <span className={`${partner.style} text-[var(--color-text)]`}>
              {partner.name.split(" ")[0]}
            </span>
            {"sub" in partner && partner.sub && (
              <span className="block text-[0.55rem] tracking-[0.2em] uppercase text-[var(--color-text-light)] mt-0.5">
                {partner.sub}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-[200px] h-[100px] bg-white rounded-2xl shadow-sm flex items-center justify-center px-6">
      {"logo" in partner && partner.logo && (
        <Image
          src={partner.logo}
          alt={partner.name}
          width={140}
          height={60}
          className="max-h-[50px] w-auto object-contain"
        />
      )}
    </div>
  );
}

export default function Partners() {
  const doubled = [...partners, ...partners];

  return (
    <section className="py-16 bg-[var(--color-bg)] overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-10">
        <h3 className="text-center text-lg font-medium text-[var(--color-text)] tracking-tight mb-10">
          Our Trusted Partners
        </h3>
      </div>

      <div className="relative">
        <div className="flex gap-6 animate-scroll-partners">
          {doubled.map((partner, i) => (
            <PartnerCard key={`${partner.name}-${i}`} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
