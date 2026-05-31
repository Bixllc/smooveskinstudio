"use client";

import { useRef, useState } from "react";
import type { FormField, FormAnswers } from "@/lib/forms";
import { validateFormAnswers } from "@/lib/forms";

export interface FormTemplateForStep {
  id: string;
  name: string;
  description: string | null;
  type: string;
  fields: FormField[];
  required: boolean;
}

interface FormsStepProps {
  forms: FormTemplateForStep[];
  initialAnswers: Array<{ formTemplateId: string; answers: FormAnswers }>;
  onSubmit: (answers: Array<{ formTemplateId: string; answers: FormAnswers }>) => void;
}

export function FormsStep({ forms, initialAnswers, onSubmit }: FormsStepProps) {
  const [allAnswers, setAllAnswers] = useState<
    Array<{ formTemplateId: string; answers: FormAnswers }>
  >(() =>
    forms.map((f) => ({
      formTemplateId: f.id,
      answers: initialAnswers.find((a) => a.formTemplateId === f.id)?.answers ?? {},
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Signature canvas refs keyed by `${formIndex}-${fieldId}`
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const drawingState = useRef<Map<string, boolean>>(new Map());

  function getAnswers(formIndex: number): FormAnswers {
    return allAnswers[formIndex]?.answers ?? {};
  }

  function setAnswer(formIndex: number, fieldId: string, value: string | boolean) {
    setAllAnswers((prev) => {
      const next = [...prev];
      next[formIndex] = {
        ...next[formIndex],
        answers: { ...next[formIndex].answers, [fieldId]: value },
      };
      return next;
    });
  }

  function canvasKey(formIndex: number, fieldId: string) {
    return `${formIndex}-${fieldId}`;
  }

  function initCanvas(key: string, canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    canvasRefs.current.set(key, canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }

  function startDraw(
    key: string,
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) {
    drawingState.current.set(key, true);
    const canvas = canvasRefs.current.get(key);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  }

  function draw(
    key: string,
    formIndex: number,
    fieldId: string,
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) {
    if (!drawingState.current.get(key)) return;
    const canvas = canvasRefs.current.get(key);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setAnswer(formIndex, fieldId, canvas.toDataURL());
  }

  function stopDraw(key: string) {
    drawingState.current.set(key, false);
  }

  function clearSignature(key: string, formIndex: number, fieldId: string) {
    const canvas = canvasRefs.current.get(key);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAnswer(formIndex, fieldId, "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const answers = getAnswers(i);
      const fieldError = validateFormAnswers(form.fields, answers);
      if (fieldError) newErrors[form.id] = fieldError;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit(allAnswers);
  }

  function renderField(field: FormField, formIndex: number) {
    const answers = getAnswers(formIndex);
    const key = canvasKey(formIndex, field.id);

    if (field.type === "text" || field.type === "date") {
      return (
        <input
          type={field.type === "date" ? "date" : "text"}
          value={String(answers[field.id] ?? "")}
          onChange={(e) => setAnswer(formIndex, field.id, e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          value={String(answers[field.id] ?? "")}
          onChange={(e) => setAnswer(formIndex, field.id, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={String(answers[field.id] ?? "")}
          onChange={(e) => setAnswer(formIndex, field.id, e.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={answers[field.id] === true}
            onChange={(e) => setAnswer(formIndex, field.id, e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-[var(--color-text)]">{field.label}</span>
        </label>
      );
    }

    if (field.type === "signature") {
      return (
        <div>
          <div className="relative rounded-xl border border-[var(--color-border)] bg-white">
            <canvas
              ref={(el) => initCanvas(key, el)}
              width={400}
              height={120}
              className="w-full touch-none rounded-xl"
              onMouseDown={(e) => startDraw(key, e)}
              onMouseMove={(e) => draw(key, formIndex, field.id, e)}
              onMouseUp={() => stopDraw(key)}
              onMouseLeave={() => stopDraw(key)}
              onTouchStart={(e) => {
                e.preventDefault();
                startDraw(key, e);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                draw(key, formIndex, field.id, e);
              }}
              onTouchEnd={() => stopDraw(key)}
            />
            {!answers[field.id] && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-light)]">
                Sign here
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => clearSignature(key, formIndex, field.id)}
            className="mt-1 text-xs text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
          >
            Clear signature
          </button>
        </div>
      );
    }

    return null;
  }

  return (
    <div>
      <h3 className="mb-2 text-center text-xl font-semibold text-[var(--color-text)]">
        Forms & Consent
      </h3>
      <p className="mb-8 text-center text-sm text-[var(--color-text-light)]">
        Please complete the required forms below before continuing.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
        {forms.map((form, formIndex) => (
          <div
            key={form.id}
            className="rounded-2xl border border-[var(--color-border)] bg-white p-6"
          >
            <h4 className="mb-1 font-semibold text-[var(--color-text)]">{form.name}</h4>
            {form.description && (
              <p className="mb-4 text-sm text-[var(--color-text-light)]">
                {form.description}
              </p>
            )}

            <div className="space-y-4">
              {form.fields.map((field) => (
                <div key={field.id}>
                  {/* Checkbox renders its own label inline */}
                  {field.type !== "checkbox" && (
                    <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                      {field.label}
                      {field.required && (
                        <span className="ml-0.5 text-red-500">*</span>
                      )}
                    </label>
                  )}
                  {renderField(field, formIndex)}
                </div>
              ))}
            </div>

            {errors[form.id] && (
              <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
                {errors[form.id]}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Continue &rarr;
        </button>
      </form>
    </div>
  );
}
