const items = [
  "As Seen On TikTok",
  "Watauga's Favorite Studio",
  "Organic Products Only",
  "Private 1-on-1 Sessions",
  "Trusted by 200+ Clients",
  "Licensed & Certified Esthetician",
  "Clean Beauty Always",
];

export default function RevealMarquee() {
  return (
    <div
      className="relative z-10 bg-[var(--color-bg)] overflow-hidden"
      style={{
        borderRadius: "32px 32px 0 0",
        marginTop: "-40px",
        paddingTop: "28px",
        paddingBottom: "28px",
      }}
    >
      {/* Fade masks on edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20"
        style={{
          background:
            "linear-gradient(to right, var(--color-bg), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20"
        style={{
          background:
            "linear-gradient(to left, var(--color-bg), transparent)",
        }}
      />

      {/* Marquee track — items duplicated for seamless loop */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee-homepage flex items-center gap-0">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="flex items-center whitespace-nowrap"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontVariant: "small-caps",
                letterSpacing: "0.12em",
                color: "var(--color-text-light)",
                padding: "0 2rem",
              }}
            >
              <span
                style={{ color: "var(--color-primary)", marginRight: "2rem" }}
              >
                ✦
              </span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
