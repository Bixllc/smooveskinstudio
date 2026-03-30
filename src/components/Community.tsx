import Image from "next/image";

const socials = [
  {
    name: "Instagram",
    handle: "@smooveskinstudio",
    followers: "4.4K",
    url: "https://www.instagram.com/smooveskinstudio/?igshid=OGQ5ZDc2ODk2ZA%3D%3D&utm_source=qr",
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    handle: "@smooveskinstudio",
    followers: "158.1K",
    url: "https://www.tiktok.com/@smooveskinstudio?_t=8gyibqF7b8k&_r=1",
    color: "bg-black",
    icon: (
      <svg width="18" height="20" viewBox="0 0 18 20" fill="white">
        <path d="M9.37 0C10.15 0 10.93.01 11.71 0c.07 1.13.49 2.3 1.33 3.1.84.82 2.01 1.2 3.14 1.35v3.07c-1.07-.04-2.14-.27-3.1-.72-.42-.2-.81-.45-1.18-.73-.01 2.37.01 4.74-.02 7.1-.06 1.14-.43 2.27-1.1 3.2a6.28 6.28 0 01-4.86 2.63c-1.22.06-2.45-.27-3.48-.91a6.24 6.24 0 01-2.76-4.67c-.02-.47-.02-.93.02-1.39.17-1.38.82-2.68 1.82-3.63a6.14 6.14 0 014.55-1.81c.02 1.14-.03 2.27-.03 3.41a2.91 2.91 0 00-2.38.56c-.6.44-1 1.11-1.12 1.83-.09.52-.01 1.08.24 1.54.43.83 1.33 1.38 2.28 1.37.94.01 1.85-.52 2.32-1.32.16-.26.28-.56.31-.87.08-1.16.05-2.32.06-3.49 0-3.28-.01-6.55 0-9.83z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    handle: "Smoove Skin Studio",
    followers: "5.3K",
    url: "https://www.youtube.com/@smooveskinstudio",
    color: "bg-red-600",
    icon: (
      <svg width="20" height="16" viewBox="0 0 20 16" fill="white">
        <path d="M19.58 2.5A2.51 2.51 0 0017.82.74C16.25.33 10 .33 10 .33s-6.25 0-7.82.41A2.51 2.51 0 00.42 2.5 26.21 26.21 0 000 8a26.21 26.21 0 00.42 5.5 2.51 2.51 0 001.76 1.76C3.75 15.67 10 15.67 10 15.67s6.25 0 7.82-.41a2.51 2.51 0 001.76-1.76A26.21 26.21 0 0020 8a26.21 26.21 0 00-.42-5.5zM8 11.23V4.77L13.2 8 8 11.23z" />
      </svg>
    ),
  },
];

export default function Community() {
  return (
    <section className="py-24 bg-[var(--color-bg-light)]">
      <div className="max-w-[1320px] mx-auto px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-border)] text-xs font-medium tracking-widest uppercase text-[var(--color-text-light)]">
            Partner With Us
          </span>
          <h2 className="mt-6 font-light text-4xl md:text-5xl tracking-tight text-[var(--color-text)]">
            Join Our{" "}
            <span className="text-[var(--color-primary)] italic">Community</span>
          </h2>
          <p className="mt-5 text-base text-[var(--color-text-light)] max-w-2xl mx-auto leading-relaxed">
            Connect with Anisha and discover exclusive partnerships with premium
            skincare brands
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Anisha Profile */}
          <div>
            <div className="relative w-64 h-64 mx-auto lg:mx-0 mb-8">
              <Image
                src="/images/community-anisha.avif"
                alt="Anisha, founder of Smoove Skin Studio"
                width={256}
                height={256}
                className="w-full h-full object-cover object-top rounded-full"
              />
            </div>
            <h3 className="text-2xl font-light tracking-tight text-[var(--color-text)] max-lg:text-center">
              Meet Anisha
            </h3>
            <p className="mt-3 text-sm text-[var(--color-text-light)] leading-relaxed max-w-md max-lg:text-center max-lg:mx-auto">
              Licensed aesthetician and founder of Smoove Skin Studio, passionate
              about delivering exceptional skincare experiences and building
              partnerships with premium beauty brands.
            </p>
          </div>

          {/* Right - Social Cards */}
          <div className="flex flex-col gap-5">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 bg-white rounded-2xl px-7 py-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-full ${social.color} flex items-center justify-center shrink-0`}
                >
                  {social.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-medium text-[var(--color-text)]">
                      {social.name}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-text-light)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--color-text-light)]">
                    {social.handle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-light tracking-tight text-[var(--color-primary-dark)]">
                    {social.followers}
                  </p>
                  <p className="text-xs text-[var(--color-text-light)]">
                    Followers
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
