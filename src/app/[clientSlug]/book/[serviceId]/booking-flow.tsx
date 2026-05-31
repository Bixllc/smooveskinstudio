"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateTimeStep } from "./steps/date-time-step";
import { CustomerInfoStep } from "./steps/customer-info-step";
import { ReviewPayStep } from "./steps/review-pay-step";
import { FormsStep, type FormTemplateForStep } from "./steps/forms-step";
import type { FormAnswers } from "@/lib/forms";

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
  forms: FormTemplateForStep[];
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
  forms,
}: BookingFlowProps) {
  const router = useRouter();

  // Step 1: Date/Time  2: Customer Info  3: Forms (skipped if no forms)  4: Review/Pay
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [formAnswers, setFormAnswers] = useState<
    Array<{ formTemplateId: string; answers: FormAnswers }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasForms = forms.length > 0;

  const stepLabels = hasForms
    ? ["Date & Time", "Your Details", "Forms & Consent", "Confirm"]
    : ["Date & Time", "Your Details", "Confirm"];

  // Map internal step number (1-4) to display index (0-based)
  function displayIndex(s: number) {
    if (!hasForms) return s === 4 ? 2 : s - 1;
    return s - 1;
  }

  function goForwardFromCustomerInfo() {
    if (hasForms) setStep(3);
    else setStep(4);
  }

  function goBackFromReviewPay() {
    if (hasForms) setStep(3);
    else setStep(2);
  }

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
          formAnswers: hasForms ? formAnswers : [],
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

  const di = displayIndex(step);

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  i <= di
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-border)] text-[var(--color-text-light)]"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  i === di
                    ? "font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text-light)]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
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
          else if (step === 2) setStep(1);
          else if (step === 3) setStep(2);
          else goBackFromReviewPay();
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
            goForwardFromCustomerInfo();
          }}
        />
      )}

      {step === 3 && hasForms && (
        <FormsStep
          forms={forms}
          initialAnswers={formAnswers}
          onSubmit={(answers) => {
            setFormAnswers(answers);
            setStep(4);
          }}
        />
      )}

      {step === 4 && selectedSlot && customerInfo && (
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
