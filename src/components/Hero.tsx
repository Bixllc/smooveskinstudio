import Image from "next/image";

export default function Hero() {
  return (
    <section className="pt-20 min-h-screen flex items-center">
      <div className="max-w-[1320px] mx-auto px-10 py-15 grid grid-cols-1 lg:grid-cols-2 gap-15 items-center max-lg:text-center">
        {/* Content */}
        <div>
          <h1 className="font-light text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[var(--color-text)]">
            <span className="block">Smoove</span>
            <span className="block text-[var(--color-primary)] italic">Skin</span>
            <span className="block">Studio</span>
          </h1>

          <p className="mt-7 text-[1.05rem] font-light leading-[1.7] text-[var(--color-text-light)] max-w-[460px] max-lg:mx-auto">
            Get waxed by an award-winning specialist with precision, care, and
            results you can feel. At Smoove Skin Studio, every service is
            designed to leave your skin smoother, cleaner, and more confident
            than ever.
          </p>

          <p className="mt-5 text-sm font-medium tracking-wider text-[var(--color-primary-dark)] uppercase">
            Full Body Brazilian Waxing in the DFW Area
          </p>

          <div className="mt-10 flex gap-4 flex-wrap max-lg:justify-center">
            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border-[1.5px] border-[var(--color-primary)] text-[var(--color-primary)] text-[0.938rem] font-medium tracking-[0.01em] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              Explore Services
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="relative max-lg:max-w-[500px] max-lg:mx-auto max-lg:pb-20">
          <div className="relative rounded-2xl">
            <Image
              src="/images/hero-image.webp"
              alt="Smoove Skin Studio — professional waxing salon in Watauga, Fort Worth TX"
              width={600}
              height={500}
              className="w-full h-[500px] object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
              priority
            />
          </div>

          {/* Testimonial Card */}
          <div className="absolute -bottom-15 left-1/2 -translate-x-1/2 bg-white rounded-xl px-7 py-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] max-w-[320px] w-full">
            <div className="flex gap-1.5 mb-3">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]"
                />
              ))}
            </div>
            <p className="text-sm text-[var(--color-text-light)] leading-relaxed italic">
              &ldquo;Anisha is amazing and always makes me feel
              comfortable&rdquo;
            </p>
            <p className="mt-2 text-[0.85rem] text-[var(--color-primary-dark)] font-medium">
              &mdash; Tammy
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
