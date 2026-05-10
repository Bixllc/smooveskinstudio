"use client";

export default function BookingError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Something went wrong
        </h2>
        <p className="mt-4 text-[var(--color-text-light)]">
          We&apos;re having trouble loading the booking page. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
