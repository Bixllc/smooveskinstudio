"use client";

import Image from "next/image";
import { useState } from "react";

type Category = { id: string; name: string };

const CONTACT = {
  address: "7600 Denton Hwy, Suite #139",
  city: "Watauga, Texas",
  addressNote: "Inside Mattison Avenue Salon Suites",
  hours: "Tue–Sat · 10am–6pm",
  phone: "(682) 241-2984",
  phoneHref: "tel:+16822412984",
};

export default function Footer({
  categories = [],
  clientSlug = "smooveskinstudio",
}: {
  categories?: Category[];
  clientSlug?: string;
}) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Footer email signup:", email);
    setEmail("");
  };

  return (
    <footer style={{ backgroundColor: "var(--color-bg-light)", paddingTop: "64px", paddingBottom: "32px" }}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-14"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          {/* Zone 1 — Brand */}
          <div>
            <Image
              src="/images/logo.svg"
              alt="Smoove Skin Studio"
              width={80}
              height={90}
              className="h-16 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "#6B5F54" }}>
              Private. Intentional. Yours. Award-winning waxing &amp; skin care in the DFW metroplex.
            </p>
          </div>

          {/* Zone 2 — Navigate */}
          <div>
            <h4
              className="text-xs font-medium tracking-widest uppercase mb-5"
              style={{ color: "#9A6A4E" }}
            >
              Navigate
            </h4>
            <ul className="flex flex-col gap-3">
              {["Home", "About", "Services", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={link === "Home" ? "/" : `#${link.toLowerCase()}`}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: "#6B5F54" }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Zone 3 — Visit */}
          <div>
            <h4
              className="text-xs font-medium tracking-widest uppercase mb-5"
              style={{ color: "#9A6A4E" }}
            >
              Visit
            </h4>
            <div className="flex flex-col gap-3 text-sm" style={{ color: "#6B5F54" }}>
              <div>
                <p>{CONTACT.address}</p>
                <p>{CONTACT.city}</p>
                <p className="mt-1 text-xs" style={{ color: "#9A6A4E" }}>{CONTACT.addressNote}</p>
              </div>
              <p>{CONTACT.hours}</p>
              <a
                href={CONTACT.phoneHref}
                className="font-medium transition-opacity hover:opacity-70"
                style={{ color: "#2E1F17" }}
              >
                {CONTACT.phone}
              </a>
            </div>
          </div>

          {/* Zone 4 — Email signup card */}
          <div>
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.15rem",
                  fontWeight: 300,
                  color: "#2E1F17",
                  lineHeight: 1.3,
                }}
              >
                Skin Tips, Studio Updates &amp; Exclusive Deals.
              </h3>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "#6B5F54" }}>
                Join 500+ clients who get early access to new services, seasonal offers, and
                Anisha&apos;s personal skin care advice.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 px-3 py-2.5 rounded-full text-xs border outline-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full text-xs font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#2E1F17" }}
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#9A6A4E" }}>
            © 2026 Smoove Skin Studio. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs transition-opacity hover:opacity-70" style={{ color: "#9A6A4E" }}>
              Privacy Policy
            </a>
            <a href="#" className="text-xs transition-opacity hover:opacity-70" style={{ color: "#9A6A4E" }}>
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
