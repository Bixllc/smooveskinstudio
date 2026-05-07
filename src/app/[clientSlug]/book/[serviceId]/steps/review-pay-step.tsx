"use client";

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
      <h3 className="mb-4 text-lg font-medium text-[var(--color-text)]">
        Review & Pay
      </h3>

      <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6">
        {/* Service */}
        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Service
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {service.name}
          </p>
          <p className="text-xs text-[var(--color-text-light)]">
            {service.durationMinutes} minutes
          </p>
        </div>

        {/* Date & Time */}
        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Date & Time
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {dateStr}
          </p>
          <p className="text-sm text-[var(--color-text)]">{timeStr}</p>
        </div>

        {/* Customer */}
        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Contact
          </p>
          <p className="text-sm text-[var(--color-text)]">
            {customerInfo.fullName}
          </p>
          <p className="text-sm text-[var(--color-text)]">
            {customerInfo.email}
          </p>
          <p className="text-sm text-[var(--color-text)]">
            {customerInfo.phone}
          </p>
          {customerInfo.notes && (
            <p className="mt-1 text-xs text-[var(--color-text-light)]">
              Note: {customerInfo.notes}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-text)]">
              {service.paymentType === "DEPOSIT" ? "Deposit Due" : "Total"}
            </p>
            <p className="text-lg font-semibold text-[var(--color-text)]">
              ${chargeAmount.toFixed(2)}
            </p>
          </div>
          {service.paymentType === "DEPOSIT" && (
            <p className="mt-1 text-xs text-[var(--color-text-light)]">
              Full service price: ${service.price.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={onConfirm}
        disabled={isSubmitting}
        className="mt-6 w-full rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : "Confirm & Pay"}
      </button>
    </div>
  );
}
