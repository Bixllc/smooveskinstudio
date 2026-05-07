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

  const steps = ["Date & Time", "Your Info", "Review & Pay"];

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

      // Redirect to Square checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Fallback: go to confirmation
        router.push(`/${clientSlug}/confirmation/${data.bookingId}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => {
          if (step === 1) router.back();
          else setStep((s) => (s - 1) as 1 | 2 | 3);
        }}
        className="mb-4 text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
      >
        &larr; {step === 1 ? "Back to Services" : "Back"}
      </button>

      {/* Service header */}
      <div className="mb-6">
        <p className="text-sm text-[var(--color-text-light)]">
          {service.categoryName}
        </p>
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          {service.name}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-light)]">
          {service.durationMinutes} min &middot; $
          {service.price.toFixed(2)}
          {service.paymentType === "DEPOSIT" && service.depositAmount && (
            <span> (${service.depositAmount.toFixed(2)} deposit required)</span>
          )}
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex gap-1">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1 rounded-full ${
                i + 1 <= step
                  ? "bg-[var(--color-primary)]"
                  : "bg-[var(--color-border)]"
              }`}
            />
            <p
              className={`mt-1 text-xs ${
                i + 1 === step
                  ? "font-medium text-[var(--color-text)]"
                  : "text-[var(--color-text-light)]"
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

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

      {step === 2 && (
        <CustomerInfoStep
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
