"use client";

import Image from "next/image";
import { useBookingGate } from "@/components/BookingPolicyGate";

type ServicesProps = {
  services: { id: string; name: string; categoryId: string }[];
  categories: { id: string; name: string }[];
  clientSlug: string;
};

const CATEGORY_META: Record<string, { image: string; shortName: string; description: string }> = {
  "Body Waxing": {
    image: "/images/cat-body-waxing.png",
    shortName: "Body Waxing",
    description:
      "Smooth, precise waxing from head to toe — Brazilians, legs, arms, underarms, and the full-body Smoove finish.",
  },
  "Face Waxing": {
    image: "/images/cat-face-waxing.png",
    shortName: "Face Waxing",
    description:
      "Precision waxing for the face — lip, chin, and sideburns for clean, smooth, camera-ready results.",
  },
  "Brow Services": {
    image: "/images/cat-brow-waxing.png",
    shortName: "Brow Services",
    description:
      "Defined, sculpted brows done right — precision wax, tint, and the brow wax & tint combo for a polished finish.",
  },
};

const DISPLAY_CATEGORIES = [
  "Body Waxing",
  "Face Waxing",
  "Brow Services",
];

const BOOKING_URL = "https://smooveskin.as.me/schedule/64a2c692";

export default function Services({}: ServicesProps) {
  const { requestBooking } = useBookingGate();

  return (
    <section id="services" className="py-24" style={{ backgroundColor: "#F4EDE2" }}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="text-center mb-14">
          <h2
            style={{
              fontFamily: "var(--home-font-serif), serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              lineHeight: 1.1,
              fontWeight: 300,
              color: "#2E1F17",
            }}
          >
            Every service, tailored to you.
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto leading-relaxed" style={{ color: "#6B5F54" }}>
            From precise body and face waxing to sculpted brows — three focused categories,
            all customized on the day.
          </p>
        </div>

        {/* 3 Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DISPLAY_CATEGORIES.map((name) => {
            const meta = CATEGORY_META[name];
            return (
              <div
                key={name}
                className="bg-white rounded-2xl overflow-hidden flex flex-col group"
                style={{
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: "260px" }}>
                  {meta?.image ? (
                    <Image
                      src={meta.image}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: "#E8DDD1" }} />
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <h3
                    style={{
                      fontFamily: "var(--home-font-serif), serif",
                      fontSize: "1.7rem",
                      fontWeight: 300,
                      color: "#2E1F17",
                      lineHeight: 1.2,
                    }}
                  >
                    {meta?.shortName ?? name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed flex-1" style={{ color: "#6B5F54" }}>
                    {meta?.description}
                  </p>
                  <button
                    onClick={() => requestBooking(BOOKING_URL)}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium self-start transition-all duration-300"
                    style={{ border: "1.5px solid #2E1F17", color: "#2E1F17", background: "transparent", cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.backgroundColor = "#2E1F17";
                      el.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.backgroundColor = "transparent";
                      el.style.color = "#2E1F17";
                    }}
                  >
                    Book Now <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={() => requestBooking(BOOKING_URL)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#2E1F17", border: "none", cursor: "pointer" }}
          >
            View All Services <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
