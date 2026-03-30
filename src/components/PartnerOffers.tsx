const offers = [
  {
    name: "BushBalm Aftercare",
    discount: "20% OFF",
    url: "https://bushbalm.superfiliate.com/SMOOVESKIN",
  },
  {
    name: "BushBalm Pro",
    discount: "$50 off",
    url: "https://pros.bushbalm.com/?ll_ref_id=5ogyvV0SO",
  },
  {
    name: "Wax Wax",
    discount: "30% OFF",
    code: "SSSVIP",
    url: "https://www.waxwax.com/?rfsn=7811340.776d3a",
  },
  {
    name: "Tress Wellness Bikini Star Wax",
    url: "https://www.amazon.com/dp/B09XRB7YWH/ref=cm_sw_r_as_gl_api_gl_i_B5KG99WCEGPP505Y41BT?linkCode=ml1&tag=anishas17-20&th=1",
  },
  {
    name: "Tress Wellness Waxing Kit",
    url: "https://www.amazon.com/dp/B0B8RT97ZL/ref=cm_sw_r_as_gl_api_gl_i_DYWCGKSD1MXWKXEX9PB7?linkCode=ml1&tag=anishas17-20",
  },
  {
    name: "Honeycomb Wax",
    discount: "10% OFF",
    code: "SSS10",
    url: "https://honeycombwaxco.com/?ref=AnishaD&utm_source=affiliate",
  },
  {
    name: "Indulge Wax",
    discount: "10% OFF",
    code: "Smooveskin",
    url: "https://www.indulgewax.com/?sca_ref=4973353.sXK76wzuE5",
  },
  {
    name: "NovaWax - Luxury Wax",
    url: "https://nova-wax.com/?rfsn=7802111.a1bedb",
  },
  {
    name: "Waxness",
    code: "Smooveskin",
    url: "https://waxness.com/hard-wax/147-polymer-blend-premium-luxury-hard-wax-beads-russian-pearl-22-lb-3527-oz.html",
  },
];

export default function PartnerOffers() {
  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-[1320px] mx-auto px-10">
        <h2 className="text-center text-2xl md:text-3xl font-medium text-[var(--color-text)] tracking-tight mb-12">
          Exclusive Partner Offers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <div
              key={offer.name}
              className="bg-white rounded-2xl shadow-sm p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-medium text-[var(--color-text)]">
                    {offer.name}
                  </h3>
                  {offer.discount && (
                    <span className="shrink-0 text-xs font-medium text-[var(--color-primary-dark)] border border-[var(--color-border)] rounded-full px-3 py-1">
                      {offer.discount}
                    </span>
                  )}
                </div>
                {offer.code && (
                  <p className="text-sm text-[var(--color-text-light)]">
                    Code: {offer.code}
                  </p>
                )}
              </div>

              <a
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full text-center py-3 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium tracking-[0.01em] hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Shop Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
