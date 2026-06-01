"use client";

const testimonials = [
  {
    name: "Khloe Langston",
    text: "Anisha is absolutely amazing! I used to go to European wax and saw several different people and she is by far the best!",
    rating: 5,
  },
  {
    name: "Phylicia Durman",
    text: "Overall quick and great service",
    rating: 5,
  },
  {
    name: "Mikala",
    text: "Anisha is truly everything. She took her time and didn't leave no hair behind. Anisha, Thank you for your positive vibes. Ladies, Anisha is the truth and she has found herself a forever client!",
    rating: 5,
  },
  {
    name: "Lyndsey",
    text: "Anisha has amazing customer service. Her space was really clean and organized. She kept me engaged the whole time before snatching my soul and getting me ready for my date night. She made me feel very comfortable in her space. Truly glad I found her.",
    rating: 5,
  },
  {
    name: "Nakeisha Sealey",
    text: "She's the best! Love going to Smoove Skin Studio. I've noticed a major difference right away compared to other waxing businesses. The owner really cares about your skin and makes sure you're well taken care of. Ever since going here I've seen no ingrown.",
    rating: 5,
  },
  {
    name: "Ebony Porter",
    text: "Anisha was very great at making you feel comfortable during the process!",
    rating: 5,
  },
];

function TestimonialCard({
  name,
  text,
  rating,
}: {
  name: string;
  text: string;
  rating: number;
}) {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px] bg-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
      <div className="flex gap-1.5 mb-5">
        {[...Array(rating)].map((_, i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]"
          />
        ))}
      </div>
      <p className="text-sm text-[var(--color-text-light)] leading-relaxed italic flex-1">
        &ldquo;{text}&rdquo;
      </p>
      <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
        <p className="text-sm font-medium text-[var(--color-text)]">{name}</p>
        <p className="text-xs text-[var(--color-text-light)] mt-0.5">
          Verified Client
        </p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  // Double the testimonials for seamless infinite loop
  const doubled = [...testimonials, ...testimonials];

  return (
    <section id="reviews" className="py-24 bg-[var(--color-bg)] overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full bg-[var(--color-bg-light)] text-xs font-medium tracking-widest uppercase text-[var(--color-primary-dark)]">
            Testimonials
          </span>
          <h2 className="mt-6 font-light text-2xl sm:text-3xl md:text-5xl tracking-tight text-[var(--color-text)]">
            What Our{" "}
            <span className="text-[var(--color-primary)] italic">Clients</span>{" "}
            Say
          </h2>
          <p className="mt-5 text-base text-[var(--color-text-light)] max-w-2xl mx-auto leading-relaxed">
            Don&apos;t just take our word for it. Hear from our valued clients
            about their transformative experiences with Anisha at Smoove Skin
            Studio.
          </p>
        </div>
      </div>

      {/* Infinite Carousel */}
      <div className="relative">
        <div className="flex gap-6 animate-scroll">
          {doubled.map((t, i) => (
            <TestimonialCard key={i} name={t.name} text={t.text} rating={t.rating} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <p className="text-base text-[var(--color-text-light)] mb-5">
          Ready to experience the Smoove difference?
        </p>
        <a
          href="#book"
          className="inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium tracking-[0.01em] hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Book Your Appointment
        </a>
      </div>
    </section>
  );
}
