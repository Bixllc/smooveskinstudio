export default function CTABanners() {
  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto px-10 flex flex-col gap-12">
        {/* Amazon Storefront */}
        <div className="bg-white rounded-3xl shadow-sm py-14 px-10 text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)] tracking-tight">
            Shop Our Amazon Storefront
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-light)] leading-relaxed max-w-xl mx-auto">
            Take the Smoove experience home with you. Browse our curated
            collection of professional-grade skincare and waxing products on
            Amazon.
          </p>
          <a
            href="https://www.amazon.com/shop/smooveskinstudio?ref_=cm_sw_r_cp_ud_aipsfshop_aipsfsmooveskinstudio_HTP46TANJXPEVDHMT6A0&ccs_id=c2ac180b-8cd0-4a8d-b57f-2bf2a8bd6e1e"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium tracking-[0.01em] hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Visit Our Amazon Store
          </a>
        </div>

        {/* Partner CTA */}
        <div className="bg-[var(--color-bg-light)] rounded-3xl py-14 px-10 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-[var(--color-text)] tracking-tight">
            Ready to <span className="text-[var(--color-primary)] italic">Partner</span> with us?
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-light)] leading-relaxed max-w-xl mx-auto">
            Join our network of premium beauty brands and connect with thousands
            of skincare enthusiasts. Let&apos;s create something beautiful
            together.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium tracking-[0.01em] hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}
