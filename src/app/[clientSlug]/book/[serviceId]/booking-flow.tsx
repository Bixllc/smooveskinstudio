"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateTimeStep } from "./steps/date-time-step";
import { CustomerInfoStep } from "./steps/customer-info-step";
import { ReviewPayStep } from "./steps/review-pay-step";

interface ServiceInfo {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  depositAmount: number | null;
  paymentType: string;
  categoryName: string;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingFlowProps {
  clientSlug: string;
  clientId: string;
  timezone: string;
  service: ServiceInfo;
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return `${minutes} min`;
}

export function BookingFlow({
  clientSlug,
  clientId,
  timezone,
  service,
}: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ["Date & Time", "Your Details", "Confirm"];

  async function handleSubmitBooking() {
    if (!selectedSlot || !customerInfo) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceId: service.id,
          startTimeUtc: selectedSlot,
          customer: {
            fullName: customerInfo.fullName,
            email: customerInfo.email,
            phone: customerInfo.phone,
            notes: customerInfo.notes || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/${clientSlug}/confirmation/${data.bookingId}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  i + 1 <= step
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-border)] text-[var(--color-text-light)]"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  i + 1 === step
                    ? "font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text-light)]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-2 h-px w-8 bg-[var(--color-border)]" />
            )}
          </div>
        ))}
      </div>

      {/* Service summary pill */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-2.5 shadow-sm">
          <span className="font-medium text-[var(--color-text)]">
            {service.name}
          </span>
          <span className="text-[var(--color-text-light)]">&middot;</span>
          <span className="text-sm text-[var(--color-text-light)]">
            {formatDuration(service.durationMinutes)}
          </span>
          <span className="text-[var(--color-text-light)]">&middot;</span>
          <span className="font-semibold text-[var(--color-primary)]">
            ${service.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => {
          if (step === 1) router.back();
          else setStep((s) => (s - 1) as 1 | 2 | 3);
        }}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
      >
        &lsaquo; {step === 1 ? "Back to Services" : "Back"}
      </button>

      {/* Steps */}
      {step === 1 && (
        <DateTimeStep
          clientId={clientId}
          serviceId={service.id}
          timezone={timezone}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => {
            setSelectedSlot(slot);
            setStep(2);
          }}
        />
      )}

      {step === 2 && selectedSlot && (
        <CustomerInfoStep
          service={service}
          selectedSlot={selectedSlot}
          timezone={timezone}
          initialValues={customerInfo}
          onSubmit={(info) => {
            setCustomerInfo(info);
            setStep(3);
          }}
        />
      )}

      {step === 3 && selectedSlot && customerInfo && (
        <ReviewPayStep
          service={service}
          selectedSlot={selectedSlot}
          customerInfo={customerInfo}
          timezone={timezone}
          isSubmitting={isSubmitting}
          error={error}
          onConfirm={handleSubmitBooking}
        />
      )}
    </div>
  );
}
