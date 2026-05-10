"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface ServiceInfo {
  name: string;
  durationMinutes: number;
  price: number;
  depositAmount: number | null;
  paymentType: string;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

interface ReviewPayStepProps {
  service: ServiceInfo;
  selectedSlot: string;
  customerInfo: CustomerInfo;
  timezone: string;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: () => void;
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return `${minutes} minutes`;
}

export function ReviewPayStep({
  service,
  selectedSlot,
  customerInfo,
  timezone,
  isSubmitting,
  error,
  onConfirm,
}: ReviewPayStepProps) {
  const zonedDate = toZonedTime(new Date(selectedSlot), timezone);
  const dateStr = format(zonedDate, "EEEE, MMMM d, yyyy");
  const timeStr = format(zonedDate, "h:mm a");

  const chargeAmount =
    service.paymentType === "DEPOSIT" && service.depositAmount
      ? service.depositAmount
      : service.price;

  return (
    <div>
      <h3 className="mb-2 text-center text-xl font-semibold text-[var(--color-text)]">
        Review & Confirm
      </h3>
      <p className="mb-8 text-center text-sm text-[var(--color-text-light)]">
        Please review your booking details before confirming
      </p>

      <div className="mx-auto max-w-2xl">
        {/* Booking details card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-sm text-[var(--color-text-light)]">Service</span>
              <span className="font-medium text-[var(--color-text)]">{service.name}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-sm text-[var(--color-text-light)]">Duration</span>
              <span className="font-medium text-[var(--color-text)]">{formatDuration(service.durationMinutes)}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-sm text-[var(--color-text-light)]">Date</span>
              <span className="font-medium text-[var(--color-text)]">{dateStr}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-sm text-[var(--color-text-light)]">Time</span>
              <span className="font-medium text-[var(--color-text)]">{timeStr}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-sm text-[var(--color-text-light)]">Name</span>
              <span className="font-medium text-[var(--color-text)]">{customerInfo.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-sm text-[var(--color-text-light)]">Email</span>
              <span className="font-medium text-[var(--color-text)]">{customerInfo.email}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-sm text-[var(--color-text-light)]">Phone</span>
              <span className="font-medium text-[var(--color-text)]">{customerInfo.phone}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-semibold text-[var(--color-text)]">
                {service.paymentType === "DEPOSIT" ? "Deposit Due" : "Total Amount"}
              </span>
              <span className="text-xl font-bold text-[var(--color-primary)]">
                ${chargeAmount.toFixed(2)}
              </span>
            </div>
            {service.paymentType === "DEPOSIT" && (
              <p className="text-right text-xs text-[var(--color-text-light)]">
                Full service price: ${service.price.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <PromoCodeField />

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
}

function PromoCodeField() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);

  function handleApply() {
    if (!code.trim()) return;
    setApplied(true);
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
      >
        {isOpen ? "Hide" : "Have a promo code or gift card?"}
      </button>

      {isOpen && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setApplied(false);
            }}
            placeholder="Enter code"
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-primary)] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={!code.trim() || applied}
            className="shrink-0 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
          >
            {applied ? "Applied" : "Apply"}
          </button>
        </div>
      )}
    </div>
  );
}
