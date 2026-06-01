# Consent & Intake Forms Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consent/intake forms to the booking portal — admins create reusable forms, assign them to services, customers complete required forms during every booking, and admins view responses on the booking detail page.

**Architecture:** Three new Prisma models (`FormTemplate`, `ServiceFormAssignment`, `FormSubmission`) using JSON columns for fields and answers. Form answers are submitted inside the existing booking creation transaction to stay atomic. A new step is inserted into the booking flow between Customer Info and Review & Pay, skipped if the service has no assigned forms.

**Tech Stack:** Next.js 15 App Router, Prisma ORM, PostgreSQL (JSON columns), TypeScript, Tailwind CSS, existing admin auth pattern (`getAdminSession`).

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `src/lib/forms.ts` | Shared TS types (`FormField`, `FormAnswers`) and `validateFormAnswers()` |
| `src/app/api/admin/forms/route.ts` | Admin: list all forms (GET), create form (POST) |
| `src/app/api/admin/forms/[formId]/route.ts` | Admin: get (GET), update (PATCH), delete (DELETE) one form |
| `src/app/api/admin/services/[id]/forms/route.ts` | Admin: list assignments (GET), assign form to service (POST) |
| `src/app/api/admin/services/[id]/forms/[formId]/route.ts` | Admin: unassign form from service (DELETE) |
| `src/app/api/admin/bookings/[bookingId]/forms/route.ts` | Admin: get form submissions for a booking (GET) |
| `src/app/api/services/[serviceId]/forms/route.ts` | Public: get forms required for a service (GET) |
| `src/app/admin/(dashboard)/forms/page.tsx` | Admin UI: form list + create/edit + field builder |
| `src/app/[clientSlug]/book/[serviceId]/steps/forms-step.tsx` | Client booking: Forms & Consent step component |

### Modified files
| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `FormType` enum + 3 models + relations on `Service`, `Booking`, `Customer`, `Client` |
| `src/app/api/bookings/route.ts` | Accept `formAnswers`, validate required forms, create `FormSubmission` records in transaction |
| `src/app/admin/(dashboard)/sidebar.tsx` | Add "Forms" nav item |
| `src/app/admin/(dashboard)/services/page.tsx` | Add form assignment section when editing a service |
| `src/app/admin/(dashboard)/bookings/[bookingId]/page.tsx` | Add form submissions section |
| `src/app/[clientSlug]/book/[serviceId]/page.tsx` | Fetch assigned forms, pass to `BookingFlow` |
| `src/app/[clientSlug]/book/[serviceId]/booking-flow.tsx` | Add step 3 (Forms & Consent), formAnswers state, conditional step skip |

---

## Chunk 1: Schema, Types, and Migration

### Task 1: Update Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `FormType` enum and three new models to `prisma/schema.prisma`**

Add after the existing enums at the bottom of the file:

```prisma
enum FormType {
  INTAKE
  CONSENT
  WAIVER
  CUSTOM
}

model FormTemplate {
  id          String    @id @default(uuid())
  clientId    String
  name        String
  description String?
  type        FormType  @default(INTAKE)
  fields      Json      @default("[]")
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  client             Client                  @relation(fields: [clientId], references: [id])
  serviceAssignments ServiceFormAssignment[]
  submissions        FormSubmission[]

  @@index([clientId])
}

model ServiceFormAssignment {
  id             String   @id @default(uuid())
  serviceId      String
  formTemplateId String
  required       Boolean  @default(true)
  displayOrder   Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  service      Service      @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  formTemplate FormTemplate @relation(fields: [formTemplateId], references: [id], onDelete: Cascade)

  @@unique([serviceId, formTemplateId])
  @@index([serviceId])
}

model FormSubmission {
  id             String   @id @default(uuid())
  clientId       String
  bookingId      String
  customerId     String
  formTemplateId String
  answers        Json     @default("{}")
  submittedAt    DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  client       Client       @relation(fields: [clientId], references: [id])
  booking      Booking      @relation(fields: [bookingId], references: [id])
  customer     Customer     @relation(fields: [customerId], references: [id])
  formTemplate FormTemplate @relation(fields: [formTemplateId], references: [id])

  @@index([bookingId])
  @@index([clientId])
  @@index([formTemplateId])
}
```

- [ ] **Step 2: Add relations to existing models**

In `model Client`, add:
```prisma
  formTemplates  FormTemplate[]
  formSubmissions FormSubmission[]
```

In `model Service`, add:
```prisma
  formAssignments ServiceFormAssignment[]
```

In `model Booking`, add:
```prisma
  formSubmissions FormSubmission[]
```

In `model Customer`, add:
```prisma
  formSubmissions FormSubmission[]
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name add-consent-forms
```

Expected: Migration created and applied successfully, Prisma client regenerated.

- [ ] **Step 4: Verify Prisma client compiles**

```bash
npx prisma validate
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add FormTemplate, ServiceFormAssignment, FormSubmission schema"
```

---

### Task 2: Create shared form types and validation

**Files:**
- Create: `src/lib/forms.ts`

- [ ] **Step 1: Create `src/lib/forms.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/forms.ts
git commit -m "feat: add form field types and validateFormAnswers"
```

---

## Chunk 2: Backend API Routes

### Task 3: Admin forms CRUD API

**Files:**
- Create: `src/app/api/admin/forms/route.ts`
- Create: `src/app/api/admin/forms/[formId]/route.ts`

- [ ] **Step 1: Create `src/app/api/admin/forms/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const forms = await prisma.formTemplate.findMany({
    where: { clientId: session.clientId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { serviceAssignments: true, submissions: true } },
    },
  });

  return NextResponse.json(forms);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, type, fields } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const validTypes = ["INTAKE", "CONSENT", "WAIVER", "CUSTOM"];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
  }

  const form = await prisma.formTemplate.create({
    data: {
      clientId: session.clientId,
      name: name.trim(),
      description: description?.trim() || null,
      type: type || "INTAKE",
      fields: Array.isArray(fields) ? fields : [],
    },
  });

  return NextResponse.json(form, { status: 201 });
}
```

- [ ] **Step 2: Create `src/app/api/admin/forms/[formId]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

async function getOwnedForm(formId: string, clientId: string) {
  return prisma.formTemplate.findFirst({
    where: { id: formId, clientId },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { formId } = await params;
  const form = await prisma.formTemplate.findFirst({
    where: { id: formId, clientId: session.clientId },
    include: {
      serviceAssignments: {
        include: { service: { select: { id: true, name: true } } },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  return NextResponse.json(form);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { formId } = await params;
  const form = await getOwnedForm(formId, session.clientId);
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  if (body.type !== undefined) data.type = body.type;
  if (body.fields !== undefined) data.fields = Array.isArray(body.fields) ? body.fields : [];
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.formTemplate.update({
    where: { id: formId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { formId } = await params;
  const form = await getOwnedForm(formId, session.clientId);
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const submissionCount = await prisma.formSubmission.count({
    where: { formTemplateId: formId },
  });

  if (submissionCount > 0) {
    // Soft delete — deactivate to preserve submission history
    await prisma.formTemplate.update({
      where: { id: formId },
      data: { active: false },
    });
    return NextResponse.json({ success: true, deactivated: true });
  }

  await prisma.formTemplate.delete({ where: { id: formId } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors related to the new files.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/forms/
git commit -m "feat: add admin forms CRUD API routes"
```

---

### Task 4: Service form assignment API

**Files:**
- Create: `src/app/api/admin/services/[id]/forms/route.ts`
- Create: `src/app/api/admin/services/[id]/forms/[formId]/route.ts`

- [ ] **Step 1: Create `src/app/api/admin/services/[id]/forms/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: serviceId } = await params;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, clientId: session.clientId },
  });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const assignments = await prisma.serviceFormAssignment.findMany({
    where: { serviceId },
    include: {
      formTemplate: {
        select: { id: true, name: true, type: true, active: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: serviceId } = await params;
  const body = await request.json();
  const { formTemplateId, displayOrder } = body;

  if (!formTemplateId) {
    return NextResponse.json({ error: "formTemplateId is required" }, { status: 400 });
  }

  // Verify both belong to this client
  const [service, form] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, clientId: session.clientId } }),
    prisma.formTemplate.findFirst({ where: { id: formTemplateId, clientId: session.clientId } }),
  ]);

  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const assignment = await prisma.serviceFormAssignment.upsert({
    where: { serviceId_formTemplateId: { serviceId, formTemplateId } },
    update: { displayOrder: displayOrder ?? 0 },
    create: { serviceId, formTemplateId, displayOrder: displayOrder ?? 0 },
  });

  return NextResponse.json(assignment, { status: 201 });
}
```

- [ ] **Step 2: Create `src/app/api/admin/services/[id]/forms/[formId]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: serviceId, formId: formTemplateId } = await params;

  // Verify service belongs to this client
  const service = await prisma.service.findFirst({
    where: { id: serviceId, clientId: session.clientId },
  });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  await prisma.serviceFormAssignment.deleteMany({
    where: { serviceId, formTemplateId },
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/services/
git commit -m "feat: add service form assignment API routes"
```

---

### Task 5: Admin booking forms read API

**Files:**
- Create: `src/app/api/admin/bookings/[bookingId]/forms/route.ts`

- [ ] **Step 1: Create `src/app/api/admin/bookings/[bookingId]/forms/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await params;

  // Verify booking belongs to this client
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: session.clientId },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const submissions = await prisma.formSubmission.findMany({
    where: { bookingId },
    include: {
      formTemplate: {
        select: { id: true, name: true, type: true, fields: true },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  return NextResponse.json(submissions);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/bookings/
git commit -m "feat: add admin booking form submissions read API"
```

---

### Task 6: Public service forms API

**Files:**
- Create: `src/app/api/services/[serviceId]/forms/route.ts`

- [ ] **Step 1: Create `src/app/api/services/[serviceId]/forms/route.ts`**

This is a public endpoint — no admin session required. The client only sees the form structure (fields), not submissions.

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  const assignments = await prisma.serviceFormAssignment.findMany({
    where: {
      serviceId,
      formTemplate: { active: true },
    },
    include: {
      formTemplate: {
        select: { id: true, name: true, description: true, type: true, fields: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  const forms = assignments.map((a) => ({
    ...a.formTemplate,
    required: a.required,
    displayOrder: a.displayOrder,
  }));

  return NextResponse.json(forms);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/services/
git commit -m "feat: add public service forms API"
```

---

### Task 7: Update booking creation to accept and validate form submissions

**Files:**
- Modify: `src/app/api/bookings/route.ts`

The booking creation endpoint must:
1. Accept `formAnswers` in the request body
2. Fetch the service's required form assignments
3. Validate that all required forms have answers
4. Validate each answer set against the form's required fields
5. Create `FormSubmission` records inside the transaction

- [ ] **Step 1: Update `src/app/api/bookings/route.ts`**

Replace the entire file:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import { createCheckoutSession } from "@/lib/square";
import { addMinutes } from "date-fns";
import { parseFields, validateFormAnswers, type FormAnswers } from "@/lib/forms";

interface FormAnswerEntry {
  formTemplateId: string;
  answers: FormAnswers;
}

interface BookingRequestBody {
  clientId: string;
  serviceId: string;
  startTimeUtc: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    notes?: string;
  };
  formAnswers?: FormAnswerEntry[];
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequestBody = await request.json();

    const validationError = validateBookingInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { clientId, serviceId, startTimeUtc: startTimeStr, customer, formAnswers = [] } = body;
    const startTimeUtc = new Date(startTimeStr);

    if (isNaN(startTimeUtc.getTime())) {
      return NextResponse.json(
        { error: "startTimeUtc must be a valid ISO date string" },
        { status: 400 }
      );
    }

    // Validate form submissions before entering the transaction
    const formError = await validateFormSubmissions(serviceId, formAnswers);
    if (formError) {
      return NextResponse.json({ error: formError }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Check slot availability inside transaction
      const available = await isSlotAvailable(
        { clientId, serviceId, startTimeUtc },
        tx
      );

      if (!available) {
        return { conflict: true } as const;
      }

      // Fetch service for duration and pricing
      const service = await tx.service.findFirstOrThrow({
        where: { id: serviceId, clientId, active: true },
      });

      const endTimeUtc = addMinutes(startTimeUtc, service.durationMinutes);

      // Upsert customer by email + clientId
      let existingCustomer = await tx.customer.findFirst({
        where: { clientId, email: customer.email },
      });

      if (existingCustomer) {
        existingCustomer = await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            fullName: customer.fullName,
            phone: customer.phone,
            notes: customer.notes,
          },
        });
      } else {
        existingCustomer = await tx.customer.create({
          data: {
            clientId,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            notes: customer.notes,
          },
        });
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          clientId,
          serviceId,
          customerId: existingCustomer.id,
          startTimeUtc,
          endTimeUtc,
          status: "PENDING_PAYMENT",
          paymentStatus: "UNPAID",
        },
      });

      // Create form submissions inside the transaction
      for (const entry of formAnswers) {
        await tx.formSubmission.create({
          data: {
            clientId,
            bookingId: booking.id,
            customerId: existingCustomer.id,
            formTemplateId: entry.formTemplateId,
            answers: entry.answers,
          },
        });
      }

      // Create Square checkout
      const depositAmount = service.depositAmount
        ? Number(service.depositAmount)
        : null;
      const chargeAmount =
        service.paymentType === "DEPOSIT" && depositAmount
          ? depositAmount
          : Number(service.price);

      const checkout = await createCheckoutSession({
        bookingId: booking.id,
        serviceName: service.name,
        amount: Math.round(chargeAmount * 100),
        customerEmail: customer.email,
      });

      // Store the payment reference on booking
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentProvider: "square",
          paymentId: checkout.paymentId,
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          clientId,
          bookingId: booking.id,
          provider: "square",
          providerPaymentId: checkout.paymentId,
          amount: chargeAmount,
          status: "PENDING",
        },
      });

      return {
        conflict: false,
        bookingId: booking.id,
        checkoutUrl: checkout.checkoutUrl,
      } as const;
    });

    if (result.conflict) {
      return NextResponse.json(
        { error: "Time slot is no longer available" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { bookingId: result.bookingId, checkoutUrl: result.checkoutUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

/**
 * Validates that all required forms for the service have been answered correctly.
 * Returns an error string or null if valid.
 */
async function validateFormSubmissions(
  serviceId: string,
  formAnswers: FormAnswerEntry[]
): Promise<string | null> {
  const assignments = await prisma.serviceFormAssignment.findMany({
    where: {
      serviceId,
      required: true,
      formTemplate: { active: true },
    },
    include: {
      formTemplate: { select: { id: true, name: true, fields: true } },
    },
  });

  const answersMap = new Map(formAnswers.map((e) => [e.formTemplateId, e.answers]));

  for (const assignment of assignments) {
    const answers = answersMap.get(assignment.formTemplateId);
    if (!answers) {
      return `Form "${assignment.formTemplate.name}" is required and must be completed`;
    }

    const fields = parseFields(assignment.formTemplate.fields);
    const fieldError = validateFormAnswers(fields, answers);
    if (fieldError) {
      return `${assignment.formTemplate.name}: ${fieldError}`;
    }
  }

  return null;
}

function validateBookingInput(body: any): string | null {
  if (!body.clientId || typeof body.clientId !== "string") {
    return "clientId is required";
  }
  if (!body.serviceId || typeof body.serviceId !== "string") {
    return "serviceId is required";
  }
  if (!body.startTimeUtc || typeof body.startTimeUtc !== "string") {
    return "startTimeUtc is required";
  }
  if (!body.customer || typeof body.customer !== "object") {
    return "customer is required";
  }
  if (!body.customer.fullName || typeof body.customer.fullName !== "string") {
    return "customer.fullName is required";
  }
  if (!body.customer.email || typeof body.customer.email !== "string") {
    return "customer.email is required";
  }
  if (!body.customer.phone || typeof body.customer.phone !== "string") {
    return "customer.phone is required";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer.email)) {
    return "customer.email must be a valid email address";
  }
  return null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/bookings/route.ts
git commit -m "feat: validate and save form submissions in booking creation"
```

---

## Chunk 3: Admin UI

### Task 8: Add Forms to admin sidebar

**Files:**
- Modify: `src/app/admin/(dashboard)/sidebar.tsx`

- [ ] **Step 1: Add "Forms" to `navItems` in sidebar**

In `src/app/admin/(dashboard)/sidebar.tsx`, update the `navItems` array:

```ts
const navItems = [
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/settings", label: "Settings" },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/(dashboard)/sidebar.tsx
git commit -m "feat: add Forms to admin sidebar"
```

---

### Task 9: Admin forms list and editor page

**Files:**
- Create: `src/app/admin/(dashboard)/forms/page.tsx`

This is a client component following the same pattern as `services/page.tsx`. It provides:
- List of all form templates
- Inline create/edit form with a field builder
- Delete (or deactivate) a form

- [ ] **Step 1: Create `src/app/admin/(dashboard)/forms/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { FormField, FieldType } from "@/lib/forms";

interface FormTemplate {
  id: string;
  name: string;
  description: string | null;
  type: string;
  fields: FormField[];
  active: boolean;
  _count: { serviceAssignments: number; submissions: number };
}

interface FormState {
  name: string;
  description: string;
  type: string;
  fields: FormField[];
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  type: "INTAKE",
  fields: [],
  active: true,
};

function newField(): FormField {
  return {
    id: `field_${Date.now()}`,
    label: "",
    type: "text",
    required: true,
  };
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchForms() {
    const res = await fetch("/api/admin/forms");
    if (res.ok) setForms(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchForms(); }, []);

  function startEdit(t: FormTemplate) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      description: t.description ?? "",
      type: t.type,
      fields: t.fields,
      active: t.active,
    });
    setShowEditor(true);
  }

  function resetEditor() {
    setForm(emptyForm);
    setEditingId(null);
    setShowEditor(false);
    setError(null);
  }

  function updateField(index: number, patch: Partial<FormField>) {
    setForm((prev) => {
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], ...patch };
      return { ...prev, fields };
    });
  }

  function removeField(index: number) {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  }

  function addField() {
    setForm((prev) => ({ ...prev, fields: [...prev.fields, newField()] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      type: form.type,
      fields: form.fields,
      active: form.active,
    };

    const url = editingId ? `/api/admin/forms/${editingId}` : "/api/admin/forms";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetEditor();
      fetchForms();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this form? If it has submissions it will be deactivated instead.")) return;
    const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
    if (res.ok) fetchForms();
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-light)]">Loading...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">Forms</h2>
        {!showEditor && (
          <Button onClick={() => setShowEditor(true)}>New Form</Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {/* Editor */}
      {showEditor && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-6"
        >
          <p className="mb-4 text-sm font-medium text-[var(--color-text)]">
            {editingId ? "Edit Form" : "New Form"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fName">Form Name *</Label>
              <Input
                id="fName"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                className="mt-1"
                placeholder="e.g. Waxing Consent Form"
              />
            </div>

            <div>
              <Label htmlFor="fType">Type</Label>
              <select
                id="fType"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="INTAKE">Intake</option>
                <option value="CONSENT">Consent</option>
                <option value="WAIVER">Waiver</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="fDesc">Description</Label>
              <Textarea
                id="fDesc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="fActive"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="fActive">Active</Label>
            </div>
          </div>

          {/* Field builder */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--color-text)]">Fields</p>
              <Button type="button" size="sm" variant="outline" onClick={addField}>
                + Add Field
              </Button>
            </div>

            {form.fields.length === 0 && (
              <p className="text-sm text-[var(--color-text-light)]">
                No fields yet. Add fields above.
              </p>
            )}

            <div className="space-y-3">
              {form.fields.map((field, i) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-[var(--color-border)] p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Label *</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(i, { label: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="e.g. Do you have any allergies?"
                      />
                    </div>

                    <div>
                      <Label>Type</Label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(i, { type: e.target.value as FieldType })
                        }
                        className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="select">Dropdown</option>
                        <option value="date">Date</option>
                        <option value="signature">Signature</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id={`req-${i}`}
                        checked={field.required}
                        onChange={(e) => updateField(i, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={`req-${i}`}>Required</Label>
                    </div>

                    {field.type !== "checkbox" && field.type !== "signature" && (
                      <div className="sm:col-span-2">
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder ?? ""}
                          onChange={(e) => updateField(i, { placeholder: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    )}

                    {field.type === "select" && (
                      <div className="sm:col-span-2">
                        <Label>Options (one per line)</Label>
                        <Textarea
                          value={(field.options ?? []).join("\n")}
                          onChange={(e) =>
                            updateField(i, {
                              options: e.target.value
                                .split("\n")
                                .map((o) => o.trim())
                                .filter(Boolean),
                            })
                          }
                          rows={3}
                          className="mt-1"
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeField(i)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="submit">
              {editingId ? "Update Form" : "Create Form"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetEditor}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Form list */}
      <div className="space-y-2">
        {forms.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--color-text)]">{t.name}</p>
                <Badge variant="outline">{t.type}</Badge>
                {!t.active && <Badge variant="outline">Inactive</Badge>}
              </div>
              <p className="text-xs text-[var(--color-text-light)]">
                {t.fields.length} field{t.fields.length !== 1 ? "s" : ""} &middot;{" "}
                {t._count.serviceAssignments} service{t._count.serviceAssignments !== 1 ? "s" : ""}{" "}
                &middot; {t._count.submissions} submission{t._count.submissions !== 1 ? "s" : ""}
              </p>
              {t.description && (
                <p className="mt-0.5 text-xs text-[var(--color-text-light)]">{t.description}</p>
              )}
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => startEdit(t)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}

        {forms.length === 0 && (
          <p className="text-sm text-[var(--color-text-light)]">
            No forms yet. Create one above.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/(dashboard)/forms/
git commit -m "feat: add admin forms management page"
```

---

### Task 10: Add form assignment to service admin page

**Files:**
- Modify: `src/app/admin/(dashboard)/services/page.tsx`

Add a form assignment section that appears when a service is being edited. This shows the currently assigned forms with an unassign button, and a dropdown to assign a new form.

- [ ] **Step 1: Add `AssignedForms` component to the bottom of `services/page.tsx`**

Add this interface and component at the bottom of the file (before the final closing):

```tsx
interface AssignedForm {
  id: string;
  formTemplateId: string;
  displayOrder: number;
  formTemplate: { id: string; name: string; type: string };
}

function AssignedForms({
  serviceId,
  allForms,
}: {
  serviceId: string;
  allForms: { id: string; name: string }[];
}) {
  const [assignments, setAssignments] = useState<AssignedForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchAssignments() {
    const res = await fetch(`/api/admin/services/${serviceId}/forms`);
    if (res.ok) setAssignments(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAssignments(); }, [serviceId]);

  async function handleAssign() {
    if (!selectedFormId) return;
    await fetch(`/api/admin/services/${serviceId}/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formTemplateId: selectedFormId, displayOrder: assignments.length }),
    });
    setSelectedFormId("");
    fetchAssignments();
  }

  async function handleUnassign(formTemplateId: string) {
    await fetch(`/api/admin/services/${serviceId}/forms/${formTemplateId}`, {
      method: "DELETE",
    });
    fetchAssignments();
  }

  const assignedIds = new Set(assignments.map((a) => a.formTemplateId));
  const available = allForms.filter((f) => !assignedIds.has(f.id));

  if (loading) return <p className="text-xs text-[var(--color-text-light)]">Loading forms...</p>;

  return (
    <div className="mt-6 border-t border-[var(--color-border)] pt-4">
      <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Assigned Forms</p>

      {assignments.length === 0 && (
        <p className="mb-3 text-xs text-[var(--color-text-light)]">No forms assigned.</p>
      )}

      <div className="mb-3 space-y-1">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <span className="text-[var(--color-text)]">{a.formTemplate.name}</span>
            <button
              type="button"
              onClick={() => handleUnassign(a.formTemplateId)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {available.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Select a form to assign…</option>
            {available.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <Button type="button" size="sm" onClick={handleAssign} disabled={!selectedFormId}>
            Assign
          </Button>
        </div>
      )}

      {available.length === 0 && assignments.length > 0 && (
        <p className="text-xs text-[var(--color-text-light)]">All active forms are assigned.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire `AssignedForms` into the service edit form**

Inside the `ServicesPage` component, add a `forms` state alongside `services` and `categories`:

```ts
const [allForms, setAllForms] = useState<{ id: string; name: string }[]>([]);
```

Update `fetchData` to also fetch forms:

```ts
async function fetchData() {
  const [servicesRes, categoriesRes, formsRes] = await Promise.all([
    fetch("/api/admin/services"),
    fetch("/api/admin/categories"),
    fetch("/api/admin/forms"),
  ]);
  if (servicesRes.ok) setServices(await servicesRes.json());
  if (categoriesRes.ok) setCategories(await categoriesRes.json());
  if (formsRes.ok) {
    const data = await formsRes.json();
    setAllForms(data.filter((f: any) => f.active));
  }
  setLoading(false);
}
```

Inside `{showForm && (<form ...>)}`, add `<AssignedForms>` after the button row, but only when editing:

```tsx
{editingId && (
  <AssignedForms serviceId={editingId} allForms={allForms} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/(dashboard)/services/page.tsx
git commit -m "feat: add form assignment section to service edit"
```

---

### Task 11: Show form submissions on booking detail page

**Files:**
- Modify: `src/app/admin/(dashboard)/bookings/[bookingId]/page.tsx`

- [ ] **Step 1: Fetch form submissions in the page query**

In `BookingDetailPage`, after the `settings` query, add:

```ts
const formSubmissions = await prisma.formSubmission.findMany({
  where: { bookingId },
  include: {
    formTemplate: { select: { name: true, type: true, fields: true } },
  },
  orderBy: { submittedAt: "asc" },
});
```

- [ ] **Step 2: Add form submissions section to the JSX**

Import `parseFields` and `parseAnswers` at the top of the file:

```ts
import { parseFields, parseAnswers } from "@/lib/forms";
```

Add this block inside the card div, after the `{booking.notes && ...}` section:

```tsx
{formSubmissions.length > 0 && (
  <div>
    <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
      Form Submissions
    </p>

    <div className="mt-2 space-y-4">
      {formSubmissions.map((sub) => {
        const fields = parseFields(sub.formTemplate.fields);
        const answers = parseAnswers(sub.answers);

        return (
          <div
            key={sub.id}
            className="rounded-lg border border-[var(--color-border)] p-4"
          >
            <p className="mb-3 text-sm font-medium text-[var(--color-text)]">
              {sub.formTemplate.name}
            </p>

            <div className="space-y-3">
              {fields.map((field) => {
                const answer = answers[field.id];
                return (
                  <div key={field.id}>
                    <p className="text-xs font-medium text-[var(--color-text-light)]">
                      {field.label}
                    </p>

                    {field.type === "signature" ? (
                      answer ? (
                        <img
                          src={String(answer)}
                          alt="Signature"
                          className="mt-1 max-h-24 rounded border border-[var(--color-border)]"
                        />
                      ) : (
                        <p className="text-sm text-[var(--color-text-light)]">No signature</p>
                      )
                    ) : field.type === "checkbox" ? (
                      <p className="text-sm text-[var(--color-text)]">
                        {answer === true ? "Yes" : "No"}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--color-text)]">
                        {answer !== undefined && answer !== null
                          ? String(answer)
                          : "—"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/(dashboard)/bookings/[bookingId]/page.tsx
git commit -m "feat: show form submissions on admin booking detail page"
```

---

## Chunk 4: Client Booking Flow

### Task 12: Create the FormsStep client component

**Files:**
- Create: `src/app/[clientSlug]/book/[serviceId]/steps/forms-step.tsx`

This component receives an array of form templates with their fields and calls `onSubmit` with the collected answers.

- [ ] **Step 1: Create `src/app/[clientSlug]/book/[serviceId]/steps/forms-step.tsx`**

```tsx
"use client";

import { useRef, useState, useEffect } from "react";
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
      answers:
        initialAnswers.find((a) => a.formTemplateId === f.id)?.answers ?? {},
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Signature canvas refs: keyed by `${formIndex}-${fieldId}`
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

  // Signature canvas helpers
  function getCanvasKey(formIndex: number, fieldId: string) {
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

  function startDraw(key: string, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
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
    // Save data URL to answers after each stroke
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
      if (fieldError) {
        newErrors[form.id] = fieldError;
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit(allAnswers);
  }

  function renderField(field: FormField, formIndex: number) {
    const answers = getAnswers(formIndex);
    const key = getCanvasKey(formIndex, field.id);

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
            <option key={opt} value={opt}>{opt}</option>
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
              onTouchStart={(e) => { e.preventDefault(); startDraw(key, e); }}
              onTouchMove={(e) => { e.preventDefault(); draw(key, formIndex, field.id, e); }}
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
              <p className="mb-4 text-sm text-[var(--color-text-light)]">{form.description}</p>
            )}

            <div className="space-y-4">
              {form.fields.map((field) => (
                <div key={field.id}>
                  {/* Checkbox renders its own label */}
                  {field.type !== "checkbox" && (
                    <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                      {field.label}
                      {field.required && <span className="ml-0.5 text-red-500">*</span>}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[clientSlug]/book/[serviceId]/steps/forms-step.tsx
git commit -m "feat: add FormsStep client component with signature canvas"
```

---

### Task 13: Update booking page to fetch and pass forms

**Files:**
- Modify: `src/app/[clientSlug]/book/[serviceId]/page.tsx`

- [ ] **Step 1: Add forms fetch to `BookingPage` and pass to `BookingFlow`**

Update the `prisma.service.findFirst` query to include form assignments:

```ts
const service = await prisma.service.findFirst({
  where: { id: serviceId, clientId: client.id, active: true },
  include: {
    category: { select: { name: true } },
    formAssignments: {
      where: { formTemplate: { active: true } },
      include: {
        formTemplate: {
          select: { id: true, name: true, description: true, type: true, fields: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    },
  },
});
```

Update the `BookingFlow` props passed in JSX — add a `forms` prop:

```tsx
<BookingFlow
  clientSlug={clientSlug}
  clientId={client.id}
  timezone={client.businessSettings?.timezone ?? "America/New_York"}
  service={{
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: Number(service.price),
    depositAmount: service.depositAmount ? Number(service.depositAmount) : null,
    paymentType: service.paymentType,
    categoryName: service.category.name,
  }}
  forms={service.formAssignments.map((a) => ({
    id: a.formTemplate.id,
    name: a.formTemplate.name,
    description: a.formTemplate.description,
    type: a.formTemplate.type,
    fields: a.formTemplate.fields as any,
    required: a.required,
  }))}
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[clientSlug]/book/[serviceId]/page.tsx
git commit -m "feat: fetch and pass form assignments to BookingFlow"
```

---

### Task 14: Update BookingFlow to include the Forms step

**Files:**
- Modify: `src/app/[clientSlug]/book/[serviceId]/booking-flow.tsx`

- [ ] **Step 1: Replace `booking-flow.tsx` with updated version including step 3**

```tsx
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
  // Step 1: Date/Time, 2: Customer Info, 3: Forms (skipped if no forms), 4: Review/Pay
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [formAnswers, setFormAnswers] = useState<
    Array<{ formTemplateId: string; answers: FormAnswers }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasForms = forms.length > 0;

  // Step labels adjust based on whether forms exist
  const stepLabels = hasForms
    ? ["Date & Time", "Your Details", "Forms & Consent", "Confirm"]
    : ["Date & Time", "Your Details", "Confirm"];

  // Map internal step (1-4) to display index (0-based)
  function stepToDisplayIndex(s: number) {
    if (!hasForms) return s === 4 ? 2 : s - 1;
    return s - 1;
  }

  const displayIndex = stepToDisplayIndex(step);

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

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  i <= displayIndex
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-border)] text-[var(--color-text-light)]"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  i === displayIndex
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
          <span className="font-medium text-[var(--color-text)]">{service.name}</span>
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[clientSlug]/book/[serviceId]/booking-flow.tsx
git commit -m "feat: add Forms & Consent step to booking flow"
```

---

## Chunk 5: Manual Tests

### Task 15: Manual verification checklist

Start the dev server:

```bash
npm run dev
```

- [ ] **Test 1: Create a consent form in admin**
  1. Go to `/admin/forms`
  2. Click "New Form"
  3. Name: "Waxing Consent Form", Type: Consent
  4. Add fields:
     - "Do you have any allergies?" — textarea, required
     - "I consent to receive this treatment." — checkbox, required
     - "Signature" — signature, required
  5. Click "Create Form"
  6. Confirm form appears in list with 3 fields

- [ ] **Test 2: Assign form to a service**
  1. Go to `/admin/services`
  2. Click "Edit" on any active service
  3. Scroll to "Assigned Forms" section
  4. Select "Waxing Consent Form" from dropdown, click "Assign"
  5. Confirm it appears in the assigned list

- [ ] **Test 3: Forms step appears during booking**
  1. Go to `/{clientSlug}/book`
  2. Select the service with the assigned form
  3. Pick a date/time, click through
  4. Fill in customer info, click Continue
  5. Confirm the "Forms & Consent" step appears with all 3 fields

- [ ] **Test 4: Required field validation blocks progress**
  1. On the Forms & Consent step, click "Continue" without filling anything
  2. Confirm an error message appears for each required field
  3. Check the checkbox but leave the textarea empty
  4. Confirm the textarea error appears

- [ ] **Test 5: Complete all fields and continue**
  1. Fill in the textarea
  2. Check the consent checkbox
  3. Draw a signature in the signature canvas
  4. Click "Continue"
  5. Confirm the Review & Pay step appears

- [ ] **Test 6: Complete booking end to end**
  1. Confirm & Pay through Square
  2. After payment, confirm redirect to confirmation page

- [ ] **Test 7: Admin booking detail shows form responses**
  1. Go to `/admin/bookings`
  2. Open the booking just created
  3. Confirm "Form Submissions" section appears
  4. Confirm textarea answer, checkbox answer ("Yes"), and signature image all appear

- [ ] **Test 8: Service with no forms skips forms step**
  1. Create or find a service with no assigned forms
  2. Book it through the flow
  3. Confirm step indicator shows 3 steps (Date/Time → Your Details → Confirm)
  4. Confirm no forms step appears between customer info and review

- [ ] **Test 9: Every booking gets its own form submission**
  1. Book the same service a second time with the same customer email
  2. Complete the forms step again with different answers
  3. Open both bookings in admin
  4. Confirm each booking has its own separate form submission with its own answers

- [ ] **Step final: Push to main**

```bash
git push origin main
```
