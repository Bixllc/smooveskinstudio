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

const CATEGORY_META: Record<string, { icon: JSX.Element; description: string }> = {
  "Body & Face Waxing": {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    description: "Smooth, precise waxing head to toe",
  },
  "Brow Services": {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c3-4 5-5 10-5s7 1 10 5"/>
        <path d="M2 17c3-4 5-5 10-5s7 1 10 5"/>
      </svg>
    ),
    description: "Defined, sculpted brows done right",
  },
  "Vajacial & Hydrojelly Masks": {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    description: "Targeted skin treatments & masking",
  },
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
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.3s ease",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
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

const DISPLAY_CATEGORIES = [
  "Body & Face Waxing",
  "Brow Services",
  "Vajacial & Hydrojelly Masks",
];

export default function Services({ services, categories, clientSlug }: ServicesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Map display name → category id from DB
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  const filtered = activeCategory
    ? services.filter((s) => s.categoryId === activeCategory)
    : services;

  return (
    <section id="services" className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="font-light tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.1 }}
          >
            Every Service,{" "}
            <span className="text-[var(--color-primary)] italic">Tailored to You.</span>
          </h2>
          <p className="mt-5 text-base text-[var(--color-text-light)] max-w-xl mx-auto leading-relaxed">
            From clarifying facials to targeted skin treatments — each session is customized on the day.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {DISPLAY_CATEGORIES.map((name) => {
            const catId = categoryByName[name] ?? null;
            const isActive = activeCategory === catId;
            const meta = CATEGORY_META[name];
            const count = catId ? services.filter((s) => s.categoryId === catId).length : 0;

            return (
              <button
                key={name}
                onClick={() => setActiveCategory(isActive ? null : catId)}
                className="text-left rounded-2xl p-6 transition-all duration-300"
                style={{
                  backgroundColor: isActive ? "var(--color-primary)" : "var(--color-bg-light)",
                  border: isActive ? "1.5px solid transparent" : "1.5px solid var(--color-border)",
                  boxShadow: isActive ? "0 8px 24px rgba(196,168,130,0.25)" : "none",
                  color: isActive ? "white" : "var(--color-text)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "white",
                    color: isActive ? "white" : "var(--color-primary)",
                  }}
                >
                  {meta?.icon}
                </div>
                <p
                  className="font-medium text-base leading-snug"
                  style={{ color: isActive ? "white" : "var(--color-text)" }}
                >
                  {name}
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: isActive ? "rgba(255,255,255,0.75)" : "var(--color-text-light)" }}
                >
                  {meta?.description}
                </p>
                {count > 0 && (
                  <p
                    className="mt-3 text-xs font-medium tracking-wide"
                    style={{ color: isActive ? "rgba(255,255,255,0.6)" : "var(--color-primary-dark)" }}
                  >
                    {count} service{count !== 1 ? "s" : ""}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Service cards — 3-col desktop */}
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
