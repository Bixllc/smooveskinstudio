export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-light)] pt-16 pb-8">
      <div className="max-w-[1320px] mx-auto px-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-[var(--color-border)]">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-medium text-[var(--color-text)] tracking-tight">
              Smoove Skin Studio
            </h3>
            <p className="mt-4 text-sm text-[var(--color-text-light)] leading-relaxed max-w-sm">
              Experience the art of professional waxing and luxurious body
              treatments. Where precision meets pampering in our serene studio
              sanctuary.
            </p>

            <h4 className="mt-8 text-sm font-medium text-[var(--color-text)]">
              Follow Us
            </h4>
            <div className="mt-3 flex gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/smooveskinstudio/?igshid=OGQ5ZDc2ODk2ZA%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-primary)] group transition-colors"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors">
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="var(--color-primary-dark)" stroke="none" className="group-hover:fill-white" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@smooveskinstudio?_t=8gyibqF7b8k&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-primary)] group transition-colors"
                aria-label="TikTok"
              >
                <svg width="14" height="16" viewBox="0 0 18 20" fill="var(--color-primary-dark)" className="group-hover:fill-white transition-colors">
                  <path d="M9.37 0C10.15 0 10.93.01 11.71 0c.07 1.13.49 2.3 1.33 3.1.84.82 2.01 1.2 3.14 1.35v3.07c-1.07-.04-2.14-.27-3.1-.72-.42-.2-.81-.45-1.18-.73-.01 2.37.01 4.74-.02 7.1-.06 1.14-.43 2.27-1.1 3.2a6.28 6.28 0 01-4.86 2.63c-1.22.06-2.45-.27-3.48-.91a6.24 6.24 0 01-2.76-4.67c-.02-.47-.02-.93.02-1.39.17-1.38.82-2.68 1.82-3.63a6.14 6.14 0 014.55-1.81c.02 1.14-.03 2.27-.03 3.41a2.91 2.91 0 00-2.38.56c-.6.44-1 1.11-1.12 1.83-.09.52-.01 1.08.24 1.54.43.83 1.33 1.38 2.28 1.37.94.01 1.85-.52 2.32-1.32.16-.26.28-.56.31-.87.08-1.16.05-2.32.06-3.49 0-3.28-.01-6.55 0-9.83z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@smooveskinstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-primary)] group transition-colors"
                aria-label="YouTube"
              >
                <svg width="16" height="12" viewBox="0 0 20 16" fill="var(--color-primary-dark)" className="group-hover:fill-white transition-colors">
                  <path d="M19.58 2.5A2.51 2.51 0 0017.82.74C16.25.33 10 .33 10 .33s-6.25 0-7.82.41A2.51 2.51 0 00.42 2.5 26.21 26.21 0 000 8a26.21 26.21 0 00.42 5.5 2.51 2.51 0 001.76 1.76C3.75 15.67 10 15.67 10 15.67s6.25 0 7.82-.41a2.51 2.51 0 001.76-1.76A26.21 26.21 0 0020 8a26.21 26.21 0 00-.42-5.5zM8 11.23V4.77L13.2 8 8 11.23z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/people/Smoove-Skin-Studio/100090737730490/?mibextid=wwXIfr&rdid=K8ReBdTZl4sAr95y&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19xAdn5xf2%2F%3Fmibextid%3DwwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-primary)] group transition-colors"
                aria-label="Facebook"
              >
                <svg width="10" height="18" viewBox="0 0 10 18" fill="var(--color-primary-dark)" className="group-hover:fill-white transition-colors">
                  <path d="M6.39 18V9.79h2.67l.4-3.17H6.39V4.58c0-.92.25-1.54 1.54-1.54H9.6V.13A21.6 21.6 0 007.27 0C4.84 0 3.17 1.49 3.17 4.23v2.39H.5v3.17h2.67V18h3.22z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text)]">
              Quick Links
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a href="#services" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#book" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Book Online
                </a>
              </li>
            </ul>
          </div>

          {/* Visit Us */}
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text)]">
              Visit Us
            </h4>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <p className="text-sm text-[var(--color-text-light)]">
                    7600 Denton Hwy, Suite #139
                    <br />
                    Watauga, Texas
                  </p>
                  <p className="text-sm text-[var(--color-text-light)] italic mt-1">
                    Located inside Mattison Avenue
                    <br />
                    Salon Suites &amp; Spa
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                </svg>
                <a
                  href="mailto:info@smooveskinstudio.com"
                  className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
                >
                  info@smooveskinstudio.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--color-text-light)]">
              &copy; 2026 Smoove Skin Studio. All rights reserved.
            </p>
            <p className="text-xs text-[var(--color-text-light)] mt-1">
              Designed &amp; developed by{" "}
              <a
                href="https://bixllc.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                Bix
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
