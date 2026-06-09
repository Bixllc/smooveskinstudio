"use client";

import { useEffect, useRef, useState } from "react";

const partnerOffers = [
  {
    brand: "BushBalm",
    offer: "15% off your first order of ingrown hair serums & oils.",
    code: "SMOOVE15",
  },
  {
    brand: "GiGi Wax",
    offer: "Free wax warmer with any $50+ product purchase.",
    code: "SMOOVEGIGI",
  },
  {
    brand: "Finipil",
    offer: "Buy 2 antiseptic lotions, get 1 free — exclusive to Smoove clients.",
    code: "SMOOVEFINI",
  },
];

function useScrollFade(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

export default function CommunityPartners() {
  const [email, setEmail] = useState("");
  const partARef = useScrollFade(0.1);
  const partBRef = useScrollFade(0.1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Community email signup:", email);
    setEmail("");
  };

  return (
    <section className="py-24" style={{ backgroundColor: "#FAF5EF" }}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">

        {/* Part A — Email Signup */}
        <div
          ref={partARef}
          className="text-center max-w-2xl mx-auto"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          <span className="inline-block px-5 py-2 rounded-full bg-white text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
            Join the Community
          </span>
          <h2
            className="mt-6 font-light tracking-tight text-[var(--color-text)]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              lineHeight: 1.1,
            }}
          >
            Skin Tips, Studio Updates &{" "}
            <span className="text-[var(--color-primary)] italic">
              Exclusive Deals.
            </span>
          </h2>
          <p className="mt-5 text-base text-[var(--color-text-light)] leading-relaxed">
            Join 500+ clients who get early access to new services, seasonal
            offers, and Anisha&apos;s personal skin care advice.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 px-5 py-3.5 rounded-full text-sm border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-light)] outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <button
              type="submit"
              className="px-7 py-3.5 rounded-full text-sm font-medium text-white transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Join Now
            </button>
          </form>
        </div>

        {/* Divider */}
        <hr
          className="my-16 border-[var(--color-border)]"
          style={{ opacity: 0.6 }}
        />

        {/* Part B — Partner Offers */}
        <div
          ref={partBRef}
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: "opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s",
          }}
        >
          <div className="text-center mb-12">
            <span className="inline-block px-5 py-2 rounded-full bg-white text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
              Exclusive Partner Offers
            </span>
            <h2
              className="mt-6 font-light tracking-tight text-[var(--color-text)]"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
                lineHeight: 1.1,
              }}
            >
              Brands We{" "}
              <span className="text-[var(--color-primary)] italic">Trust,</span>{" "}
              Deals Just for You.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnerOffers.map((offer, i) => (
              <div
                key={offer.brand}
                className="bg-white rounded-2xl p-7 flex flex-col"
                style={{
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  transitionDelay: `${i * 0.08}s`,
                }}
              >
                {/* Brand logo placeholder */}
                <div
                  className="w-full rounded-xl flex items-center justify-center mb-5"
                  style={{
                    height: "80px",
                    backgroundColor: "var(--color-bg-light)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "var(--color-text-light)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {offer.brand}
                </div>
                <p className="text-sm text-[var(--color-text-light)] leading-relaxed flex-1">
                  {offer.offer}
                </p>
                <button
                  className="mt-6 w-full py-3 rounded-full text-sm font-medium border border-[var(--color-primary)] text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300"
                  onClick={() => {}}
                >
                  Claim Offer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
