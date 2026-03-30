export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-[1320px] mx-auto px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-bg-light)] text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
            Contact
          </span>
          <h2 className="mt-6 font-light text-4xl md:text-5xl tracking-tight text-[var(--color-text)]">
            Visit Our{" "}
            <span className="text-[var(--color-primary)] italic">Studio</span>
          </h2>
          <p className="mt-5 text-base text-[var(--color-text-light)] max-w-2xl mx-auto leading-relaxed">
            Ready to experience the ultimate in professional skin care? Contact
            us to book your appointment or learn more about our services.
          </p>
        </div>

        {/* Get in Touch Card */}
        <div className="bg-[var(--color-bg-light)] rounded-3xl py-14 px-10 mb-10">
          <h3 className="text-2xl font-medium text-[var(--color-text)] tracking-tight text-center">
            Get in Touch
          </h3>
          <p className="mt-3 text-base text-[var(--color-text-light)] text-center">
            We&apos;d love to hear from you. Reach out for appointments,
            questions, or consultations.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Visit Us */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary-dark)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h4 className="text-base font-medium text-[var(--color-text)]">
                Visit Us
              </h4>
              <p className="mt-2 text-sm text-[var(--color-text-light)] leading-relaxed">
                7600 Denton Hwy, Suite #139
                <br />
                Watauga, Texas
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-light)] italic">
                Located inside Mattison Avenue
                <br />
                Salon Suites &amp; Spa
              </p>
            </div>

            {/* Email Us */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary-dark)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                </svg>
              </div>
              <h4 className="text-base font-medium text-[var(--color-text)]">
                Email Us
              </h4>
              <a
                href="mailto:info@smooveskinstudio.com"
                className="mt-2 inline-block text-sm text-[var(--color-text-light)] underline hover:text-[var(--color-primary)] transition-colors"
              >
                info@smooveskinstudio.com
              </a>
            </div>

            {/* Hours */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary-dark)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h4 className="text-base font-medium text-[var(--color-text)]">
                Hours
              </h4>
              <p className="mt-2 text-sm text-[var(--color-text-light)] leading-relaxed">
                Mon - Fri: 9:00 AM - 7:00 PM
                <br />
                Saturday: 9:00 AM - 6:00 PM
                <br />
                Sunday: 11:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Book Online CTA */}
        <div id="book" className="bg-white rounded-3xl shadow-sm py-14 px-10 text-center">
          <h3 className="text-2xl font-medium text-[var(--color-text)] tracking-tight">
            Ready to Book Your Experience?
          </h3>
          <p className="mt-4 text-base text-[var(--color-text-light)] leading-relaxed max-w-xl mx-auto">
            Schedule your appointment online for the fastest booking experience.
            We look forward to welcoming you to our studio.
          </p>
          <a
            href="#book"
            className="mt-8 inline-flex items-center justify-center px-10 py-4 rounded-full bg-[var(--color-primary)] text-white text-base font-medium tracking-[0.01em] hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Book Online Now
          </a>
        </div>
      </div>
    </section>
  );
}
