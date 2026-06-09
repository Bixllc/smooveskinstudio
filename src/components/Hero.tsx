export default function Hero() {
  return (
    <>
      <style>{`
        @keyframes kenBurns {
          from { transform: scale(0.82); }
          to   { transform: scale(0.88); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-bg {
          animation: kenBurns 8s ease-out forwards;
        }
        .fade-up {
          opacity: 0;
          animation: fadeUp 0.5s ease-out forwards;
        }
      `}</style>

      <section
        className="relative w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Background image with Ken Burns zoom */}
        <div
          className="hero-bg absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url('/images/hero.jpg')",
            backgroundColor: "#c8bdb5",
            backgroundPosition: "center 30%",
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <p
              className="fade-up text-white/70 tracking-widest uppercase font-medium"
              style={{ fontSize: "0.8rem", animationDelay: "0.1s" }}
            >
              Watauga, TX · Solo Esthetician Studio
            </p>

            {/* Headline */}
            <h1
              className="fade-up mt-5 font-light text-white leading-tight"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                letterSpacing: "-0.02em",
                animationDelay: "0.3s",
              }}
            >
              Your Skin Deserves Intentional Care.
            </h1>

            {/* Subtext */}
            <p
              className="fade-up mt-5 text-white/75 font-light leading-relaxed"
              style={{
                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                animationDelay: "0.5s",
              }}
            >
              Personalized facials and skin treatments by Anisha — in a calm,
              private studio built just for you.
            </p>

            {/* CTA */}
            <div className="fade-up mt-9" style={{ animationDelay: "0.7s" }}>
              <a
                href="/smooveskinstudio/book"
                className="inline-flex items-center justify-center px-9 py-4 rounded-full text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-90 hover:scale-[1.03]"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                Book Your Session
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
