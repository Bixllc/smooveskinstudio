const features = [
  "Award-winning wax specialist",
  "Precision technique",
  "Comfortable experience",
  "Clean, professional results",
];

function CheckIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-primary-dark)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5 5-5" />
    </svg>
  );
}

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-[var(--color-bg-light)]">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-border)] text-xs font-medium tracking-widest uppercase text-[var(--color-text-light)]">
            Why Choose Us
          </span>
          <h2 className="mt-6 font-light text-2xl sm:text-3xl md:text-5xl tracking-tight text-[var(--color-text)]">
            Why Choose{" "}
            <span className="text-[var(--color-primary)] italic">
              Smoove Skin Studio
            </span>
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-4 bg-white rounded-2xl px-5 py-5 sm:px-8 sm:py-7 shadow-sm"
            >
              <CheckIcon />
              <span className="text-lg font-normal text-[var(--color-text)]">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
