"use client";

import { useEffect, useRef, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  categoryId: string;
  categoryName: string;
};

type Category = {
  id: string;
  name: string;
};

type ServicesProps = {
  services: Service[];
  categories: Category[];
  clientSlug: string;
};

function ServiceCard({
  service,
  clientSlug,
  index,
}: {
  service: Service;
  clientSlug: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset then animate
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    const timer = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, index * 80);
    return () => clearTimeout(timer);
  }, [index, service.id]);

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.3s ease, translateY 0.3s ease",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
      }}
    >
      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <h3 className="font-medium text-[var(--color-text)] tracking-tight" style={{ fontSize: "1.05rem" }}>
          {service.name}
        </h3>
        {service.description && (
          <p className="mt-3 text-sm text-[var(--color-text-light)] leading-relaxed flex-1">
            {service.description}
          </p>
        )}
        <div className="mt-5 flex items-center gap-4 text-sm text-[var(--color-text-light)]">
          <span className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            {service.durationMinutes} min
          </span>
          <span className="text-[var(--color-border)]">·</span>
          <span className="font-medium text-[var(--color-primary-dark)]">
            From ${Number(service.price).toFixed(0)}
          </span>
        </div>
        <a
          href={`/${clientSlug}/book/${service.id}`}
          className="mt-6 block w-full text-center py-3.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: "var(--color-primary)", color: "white" }}
        >
          Book This
        </a>
      </div>
    </div>
  );
}

export default function Services({ services, categories, clientSlug }: ServicesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? services.filter((s) => s.categoryId === activeCategory)
    : services;

  return (
    <section id="services" className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-bg-light)] text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
            Treatments
          </span>
          <h2
            className="mt-6 font-light tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.1 }}
          >
            Every Service,{" "}
            <span className="text-[var(--color-primary)] italic">Tailored to You.</span>
          </h2>
          <p className="mt-5 text-base text-[var(--color-text-light)] max-w-xl mx-auto leading-relaxed">
            From clarifying facials to targeted skin treatments — each session is customized on the day.
          </p>
        </div>

        {/* Category filter tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeCategory === null ? "var(--color-primary)" : "transparent",
                color: activeCategory === null ? "white" : "var(--color-text-light)",
                border: activeCategory === null ? "1.5px solid transparent" : "1.5px solid var(--color-border)",
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: activeCategory === cat.id ? "var(--color-primary)" : "transparent",
                  color: activeCategory === cat.id ? "white" : "var(--color-text-light)",
                  border: activeCategory === cat.id ? "1.5px solid transparent" : "1.5px solid var(--color-border)",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Cards — 3-col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-md:hidden">
          {filtered.map((service, i) => (
            <ServiceCard key={service.id} service={service} clientSlug={clientSlug} index={i} />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex gap-5 overflow-x-auto pb-4 md:hidden snap-x snap-mandatory">
          {filtered.map((service, i) => (
            <div key={service.id} className="min-w-[280px] snap-start flex-shrink-0">
              <ServiceCard service={service} clientSlug={clientSlug} index={i} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href={`/${clientSlug}/book`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors"
          >
            View All Services
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
