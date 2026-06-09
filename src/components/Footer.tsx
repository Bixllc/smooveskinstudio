import Image from "next/image";

type Category = { id: string; name: string };

// TODO: Pull from BusinessSettings when passed as props
const CONTACT = {
  address: "7600 Denton Hwy, Suite #139\nWatauga, Texas",
  addressNote: "Inside Mattison Avenue Salon Suites & Spa",
  hours: "Tue–Sat, 10am–6pm",
  phone: "(682) 241-2984",
  phoneHref: "tel:+16822412984",
  email: "info@smooveskinstudio.com",
};

const TIKTOK_URL = "https://www.tiktok.com/@smooveskinstudio";

export default function Footer({
  categories = [],
  clientSlug = "smooveskinstudio",
}: {
  categories?: Category[];
  clientSlug?: string;
}) {
  return (
    <footer style={{ backgroundColor: "#0f0f0f" }} className="pt-16 pb-8">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        {/* 4-zone grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-white/10">

          {/* Zone 1 — Brand */}
          <div className="lg:col-span-1">
            <Image
              src="/images/logo-transparent.avif"
              alt="Smoove Skin Studio"
              width={140}
              height={56}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="mt-4 text-sm text-white/45 leading-relaxed">
              Private. Intentional. Yours.
            </p>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg width="14" height="16" viewBox="0 0 18 20" fill="currentColor">
                <path d="M9.37 0C10.15 0 10.93.01 11.71 0c.07 1.13.49 2.3 1.33 3.1.84.82 2.01 1.2 3.14 1.35v3.07c-1.07-.04-2.14-.27-3.1-.72-.42-.2-.81-.45-1.18-.73-.01 2.37.01 4.74-.02 7.1-.06 1.14-.43 2.27-1.1 3.2a6.28 6.28 0 01-4.86 2.63c-1.22.06-2.45-.27-3.48-.91a6.24 6.24 0 01-2.76-4.67c-.02-.47-.02-.93.02-1.39.17-1.38.82-2.68 1.82-3.63a6.14 6.14 0 014.55-1.81c.02 1.14-.03 2.27-.03 3.41a2.91 2.91 0 00-2.38.56c-.6.44-1 1.11-1.12 1.83-.09.52-.01 1.08.24 1.54.43.83 1.33 1.38 2.28 1.37.94.01 1.85-.52 2.32-1.32.16-.26.28-.56.31-.87.08-1.16.05-2.32.06-3.49 0-3.28-.01-6.55 0-9.83z" />
              </svg>
              <span className="text-xs tracking-wide">@smooveskinstudio</span>
            </a>
          </div>

          {/* Zone 2 — Navigate */}
          <div>
            <h4
              className="text-xs font-medium tracking-widest uppercase mb-5"
              style={{ color: "#C4A882" }}
            >
              Navigate
            </h4>
            <ul className="flex flex-col gap-3">
              {["Home", "About", "Services", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={link === "Home" ? "/" : `#${link.toLowerCase()}`}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Zone 3 — Treatments (from data layer) */}
          <div>
            <h4
              className="text-xs font-medium tracking-widest uppercase mb-5"
              style={{ color: "#C4A882" }}
            >
              Treatments
            </h4>
            <ul className="flex flex-col gap-3">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`/${clientSlug}/book`}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {cat.name}
                    </a>
                  </li>
                ))
              ) : (
                /* TODO: Pull from service categories in data layer */
                <>
                  <li><a href={`/${clientSlug}/book`} className="text-sm text-white/50 hover:text-white transition-colors">Waxing</a></li>
                  <li><a href={`/${clientSlug}/book`} className="text-sm text-white/50 hover:text-white transition-colors">Brow Services</a></li>
                  <li><a href={`/${clientSlug}/book`} className="text-sm text-white/50 hover:text-white transition-colors">Skin Treatments</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Zone 4 — Contact */}
          <div>
            <h4
              className="text-xs font-medium tracking-widest uppercase mb-5"
              style={{ color: "#C4A882" }}
            >
              Contact
            </h4>
            <div className="flex flex-col gap-4 text-sm text-white/50">
              {/* TODO: Pull from BusinessSettings.address */}
              <div>
                {CONTACT.address.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                <p className="italic mt-1 text-white/35">{CONTACT.addressNote}</p>
              </div>
              {/* TODO: Pull from BusinessSettings (hours not in schema yet) */}
              <p>{CONTACT.hours}</p>
              {/* TODO: Pull from BusinessSettings.phone */}
              <a href={CONTACT.phoneHref} className="hover:text-white transition-colors">
                {CONTACT.phone}
              </a>
              {/* TODO: Pull from BusinessSettings.email */}
              <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors">
                {CONTACT.email}
              </a>
              <a
                href={`/${clientSlug}/book`}
                className="inline-flex items-center gap-1.5 font-medium hover:text-white transition-colors"
                style={{ color: "#C4A882" }}
              >
                Book Your Session
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © 2025 Smoove Skin Studio. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
