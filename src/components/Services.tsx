import Image from "next/image";

const services = [
  {
    title: "Body & Face Waxing",
    description:
      "Expert waxing services for face and body using premium gentle formulas. From Brazilian to full body, achieve long-lasting smoothness with our professional techniques.",
    image: "/images/service-waxing.avif",
    alt: "Body and face waxing service",
  },
  {
    title: "Brow Services",
    description:
      "Expert eyebrow shaping, tinting, and styling to perfectly frame your face. Our skilled aestheticians create beautiful, natural-looking brows tailored to you.",
    image: "/images/service-brows.avif",
    alt: "Brow shaping and tinting service",
  },
  {
    title: "Vajacial & Hydrojelly Masks",
    description:
      "Revolutionary hydrojelly masks and vajacial treatments that provide deep hydration and nourishment. Choose from various formulations to target your specific skincare needs.",
    image: "/images/service-vajacial.webp",
    alt: "Vajacial and hydrojelly mask products",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-[1320px] mx-auto px-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-bg-light)] text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
            Services
          </span>
          <h2 className="mt-6 font-light text-4xl md:text-5xl tracking-tight text-[var(--color-text)]">
            Our <span className="text-[var(--color-primary)] italic">Signature</span> Treatments
          </h2>
          <p className="mt-5 text-base text-[var(--color-text-light)] max-w-2xl mx-auto leading-relaxed">
            Professional waxing services designed to deliver smooth, clean, long-lasting results with precision, care, and expert technique.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.alt}
                  width={600}
                  height={400}
                  className="w-full h-[280px] object-cover"
                />
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-xl font-medium text-[var(--color-text)] tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm text-[var(--color-text-light)] leading-relaxed flex-1">
                  {service.description}
                </p>
                <a
                  href="/smooveskinstudio"
                  className="mt-8 block w-full text-center py-3.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium tracking-[0.01em] hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
