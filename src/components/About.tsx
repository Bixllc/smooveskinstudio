import Image from "next/image";

const stats = [
  { value: "2+", label: "Years of Experience" },
  { value: "100%", label: "Licensed Esthetician" },
  { value: "Premium", label: "Quality Products" },
  { value: "Spa", label: "Luxury Experience" },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-[var(--color-bg)]">
      <div className="max-w-[1320px] mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden">
              <Image
                src="/images/about-anisha.webp"
                alt="Anisha, licensed esthetician and wax specialist"
                width={600}
                height={750}
                className="w-full h-[650px] object-cover object-top rounded-2xl"
              />
            </div>

            {/* Testimonial Card */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl px-7 py-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] max-w-[340px] w-[90%]">
              <div className="flex gap-1.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]"
                  />
                ))}
              </div>
              <p className="text-sm text-[var(--color-text-light)] leading-relaxed italic">
                &ldquo;The most relaxing and professional experience I&apos;ve ever had.&rdquo;
              </p>
              <p className="mt-2 text-[0.85rem] text-[var(--color-primary-dark)] font-medium">
                &mdash; Sarah M.
              </p>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-bg-light)] text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
              About Me
            </span>

            <h2 className="mt-6 font-light text-4xl md:text-5xl tracking-tight text-[var(--color-text)]">
              Where <span className="text-[var(--color-primary)] italic">Expertise</span>
              <br />
              Meets Elegance
            </h2>

            <p className="mt-8 text-base text-[var(--color-text-light)] leading-relaxed">
              Hi, I&apos;m Anisha, a licensed esthetician and award-winning wax specialist. I specialize in Brazilian and full-body waxing, known for delivering smooth, clean results with precision and care.
            </p>
            <p className="mt-4 text-base text-[var(--color-text-light)] leading-relaxed">
              My goal is to create a comfortable, professional experience where you feel cared for, confident, and completely at ease every time you visit.
            </p>

            {/* Stats Grid */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[var(--color-bg-light)] rounded-xl py-6 px-4 text-center"
                >
                  <p className="text-2xl font-light tracking-tight text-[var(--color-primary-dark)]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-light)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
