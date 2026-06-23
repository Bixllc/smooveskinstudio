"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type BookingPolicyContextValue = {
  requestBooking: (href: string) => void;
};

const BookingPolicyContext = createContext<BookingPolicyContextValue | null>(null);

export function useBookingGate() {
  const ctx = useContext(BookingPolicyContext);
  if (!ctx) throw new Error("useBookingGate must be used within BookingPolicyProvider");
  return ctx;
}

const POLICY_SECTIONS = [
  {
    label: "Payment",
    body: "We accept Zelle, debit, credit, and cash.",
  },
  {
    label: "Deposit",
    body: "A $20 deposit is required to secure your booking. It's applied to your total balance, due at the end of your service.",
  },
  {
    label: "Late Arrivals",
    body: "Please be on time for your appointment. If you're running more than 5 minutes late, call or text to let us know.",
  },
  {
    label: "Cancellations",
    body: "Cancellations must be made at least 24 hours in advance to avoid a late cancellation fee.",
  },
  {
    label: "Refunds",
    body: "All services and deposits are non-refundable and non-transferable for cancellations or reschedules made with less than 24 hours' notice.",
  },
];

export function BookingPolicyProvider({ children }: { children: React.ReactNode }) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const requestBooking = useCallback((href: string) => {
    setAgreed(false);
    setPendingHref(href);
  }, []);

  const close = useCallback(() => setPendingHref(null), []);

  const confirm = useCallback(() => {
    if (!agreed || !pendingHref) return;
    window.open(pendingHref, "_blank", "noopener,noreferrer");
    setPendingHref(null);
  }, [agreed, pendingHref]);

  useEffect(() => {
    if (!pendingHref) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [pendingHref, close]);

  return (
    <BookingPolicyContext.Provider value={{ requestBooking }}>
      {children}

      {pendingHref && (
        <div
          className="policy-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-modal-title"
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(20,14,10,0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div
            className="policy-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FBF7F0",
              borderRadius: 28,
              padding: "44px 32px 32px",
              boxShadow: "0 40px 90px -30px rgba(46,31,23,0.5)",
            }}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="policy-close-btn"
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1px solid rgba(154,106,78,0.25)",
                background: "transparent",
                color: "#2E1F17",
                fontSize: 16,
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 150ms ease",
              }}
            >
              ×
            </button>

            <p
              style={{
                fontFamily: "var(--home-font-sans), sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#9A6A4E",
                marginBottom: 8,
              }}
            >
              Before You Book
            </p>

            <h2
              id="policy-modal-title"
              style={{
                fontFamily: "var(--home-font-serif), serif",
                fontWeight: 500,
                fontSize: "clamp(26px, 3vw, 32px)",
                lineHeight: 1.1,
                color: "#2E1F17",
                marginBottom: 24,
              }}
            >
              Important Policies
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {POLICY_SECTIONS.map((section) => (
                <div
                  key={section.label}
                  style={{
                    position: "relative",
                    border: "1px solid rgba(154,106,78,0.28)",
                    borderRadius: 18,
                    padding: "20px 18px 16px",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: -9,
                      left: 18,
                      background: "#FBF7F0",
                      padding: "0 8px",
                      fontFamily: "var(--home-font-sans), sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "#9A6A4E",
                    }}
                  >
                    {section.label}
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14.5,
                      lineHeight: 1.55,
                      color: "#5A463A",
                      fontWeight: 300,
                    }}
                  >
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginTop: 28,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: 3,
                  width: 16,
                  height: 16,
                  accentColor: "#3A281E",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "#5A463A", fontWeight: 300 }}>
                I have read and agree to the policies above.
              </span>
            </label>

            <button
              onClick={confirm}
              disabled={!agreed}
              className="policy-continue-btn"
              style={{
                marginTop: 22,
                width: "100%",
                padding: "16px 0",
                borderRadius: 44,
                border: "none",
                fontSize: 15,
                fontWeight: 300,
                color: "#F4EDE2",
                background: agreed ? "#3A281E" : "rgba(58,40,30,0.32)",
                cursor: agreed ? "pointer" : "not-allowed",
                transition: "background 150ms ease",
              }}
            >
              Continue to Booking →
            </button>
          </div>
        </div>
      )}

      <style>{`
        .policy-overlay { animation: policy-fade-in 0.2s ease; }
        .policy-modal { animation: policy-pop-in 0.25s ease; }
        @keyframes policy-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes policy-pop-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .policy-close-btn:hover { background: rgba(154,106,78,0.12) !important; }
        .policy-continue-btn:hover:not(:disabled) { background: #2E1F17 !important; }
      `}</style>
    </BookingPolicyContext.Provider>
  );
}
