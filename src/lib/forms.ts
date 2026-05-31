export type FieldType =
  | "text"
  | "textarea"
  | "checkbox"
  | "select"
  | "date"
  | "signature";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // only used when type === "select"
}

export type FormAnswers = Record<string, string | boolean>;

/**
 * Validates that all required fields in a form have acceptable answers.
 * Returns an error message string, or null if valid.
 */
export function validateFormAnswers(
  fields: FormField[],
  answers: FormAnswers
): string | null {
  for (const field of fields) {
    if (!field.required) continue;
    const value = answers[field.id];

    if (field.type === "checkbox") {
      if (value !== true) {
        return `"${field.label}" must be checked to continue`;
      }
    } else if (field.type === "signature") {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return `"${field.label}" signature is required`;
      }
    } else {
      if (value === undefined || value === null || String(value).trim() === "") {
        return `"${field.label}" is required`;
      }
    }
  }
  return null;
}

/** Cast Prisma's JsonValue to FormField[] safely */
export function parseFields(raw: unknown): FormField[] {
  if (!Array.isArray(raw)) return [];
  return raw as FormField[];
}

/** Cast Prisma's JsonValue to FormAnswers safely */
export function parseAnswers(raw: unknown): FormAnswers {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as FormAnswers;
}
