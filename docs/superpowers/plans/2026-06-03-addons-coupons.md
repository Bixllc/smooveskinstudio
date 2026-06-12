# Add-ons + Coupons Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add client-selectable booking add-ons and admin-generated % discount codes to the booking flow and admin portal.

**Architecture:** New Prisma models (AddOn, ServiceAddOn, BookingAddOn, Coupon) with Booking enriched by pricing snapshots. The booking engine (`availability.ts`, slots route, booking creation route) is updated to accept add-on IDs and coupon codes. Admin portal gains an Add-ons section on the Services page and a new Coupons page. The customer booking flow in `book-selection.tsx` gets a new add-ons step and a coupon field at payment.

**Tech Stack:** Next.js 14 App Router, Prisma 7 + PostgreSQL (Supabase), Square Web Payments SDK, Tailwind CSS, Vitest

---

## Chunk 1: Schema + Migration

### Task 1: Update Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new models and update existing ones**

Replace/extend `prisma/schema.prisma` with the following additions. Do NOT remove any existing models — only add and extend.

Add after the existing `BlockedTime` model:

```prisma
model AddOn {
  id              String   @id @default(uuid())
  clientId        String
  name            String
  description     String?
  price           Decimal  @db.Decimal(10, 2)
  durationMinutes Int      @default(0)
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  client        Client         @relation(fields: [clientId], references: [id])
  serviceAddOns ServiceAddOn[]
  bookingAddOns BookingAddOn[]

  @@index([clientId])
}

model ServiceAddOn {
  id           String @id @default(uuid())
  clientId     String
  serviceId    String
  addOnId      String
  displayOrder Int    @default(0)

  client  Client  @relation(fields: [clientId], references: [id])
  service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  addOn   AddOn   @relation(fields: [addOnId], references: [id], onDelete: Cascade)

  @@unique([serviceId, addOnId])
  @@index([clientId])
  @@index([serviceId])
}

model BookingAddOn {
  id              String  @id @default(uuid())
  clientId        String
  bookingId       String
  addOnId         String
  name            String
  price           Decimal @db.Decimal(10, 2)
  durationMinutes Int     @default(0)

  client  Client  @relation(fields: [clientId], references: [id])
  booking Booking @relation(fields: [bookingId], references: [id])
  addOn   AddOn   @relation(fields: [addOnId], references: [id])

  @@index([clientId])
  @@index([bookingId])
}

model Coupon {
  id              String    @id @default(uuid())
  clientId        String
  code            String
  name            String
  discountPercent Decimal   @db.Decimal(5, 2)
  usageLimit      Int?
  usageCount      Int       @default(0)
  expiresAt       DateTime?
  active          Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  client   Client    @relation(fields: [clientId], references: [id])
  bookings Booking[]

  @@unique([clientId, code])
  @@index([clientId])
}
```

On the `Client` model, add these relations inside the model body (after the existing `formSubmissions FormSubmission[]` line):

```prisma
  addOns        AddOn[]
  serviceAddOns ServiceAddOn[]
  bookingAddOns BookingAddOn[]
  coupons       Coupon[]
```

On the `Service` model, add this relation (after `formAssignments ServiceFormAssignment[]`):

```prisma
  serviceAddOns ServiceAddOn[]
```

On the `Booking` model, add these fields (after `notes String?`):

```prisma
  couponId          String?
  discountAmount    Decimal? @db.Decimal(10, 2)
  addOnsTotalAmount Decimal? @db.Decimal(10, 2)
  totalAmount       Decimal? @db.Decimal(10, 2)
```

And these relations (after `formSubmissions FormSubmission[]`):

```prisma
  coupon   Coupon?        @relation(fields: [couponId], references: [id])
  addOns   BookingAddOn[]
```

- [ ] **Step 2: Run migration and generate client**

```bash
cd /Users/sheneskawilliams/smooveskinstudio
npx prisma migrate dev --name add_addons_coupons
```

Expected: Migration created and applied, no errors.

- [ ] **Step 3: Verify build**

```bash
npx prisma generate
```

Expected: `Generated Prisma Client` message, no type errors.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add AddOn, ServiceAddOn, BookingAddOn, Coupon schema models"
```

---

## Chunk 2: Admin API — Add-ons

### Task 2: Add-ons list + create route

**Files:**
- Create: `src/app/api/admin/add-ons/route.ts`

- [ ] **Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addOns = await prisma.addOn.findMany({
    where: { clientId: session.clientId },
    include: {
      serviceAddOns: {
        select: { serviceId: true, service: { select: { name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(addOns);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, price, durationMinutes, active } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 });
  }

  const addOn = await prisma.addOn.create({
    data: {
      clientId: session.clientId,
      name: name.trim(),
      description: description?.trim() || null,
      price: Number(price),
      durationMinutes: Number(durationMinutes) || 0,
      active: active !== false,
    },
  });

  return NextResponse.json(addOn, { status: 201 });
}
```

- [ ] **Step 2: Verify file compiles**

```bash
npx tsc --noEmit
```

Expected: No errors in this file.

### Task 3: Add-on single-resource route (GET + PATCH)

**Files:**
- Create: `src/app/api/admin/add-ons/[id]/route.ts`

- [ ] **Step 1: Create the file**

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

  const { id } = await params;

  const addOn = await prisma.addOn.findFirst({
    where: { id, clientId: session.clientId },
    include: {
      serviceAddOns: {
        select: { serviceId: true, displayOrder: true },
      },
    },
  });

  if (!addOn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(addOn);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.addOn.findFirst({
    where: { id, clientId: session.clientId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, description, price, durationMinutes, active } = body;

  const addOn = await prisma.addOn.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(price !== undefined && { price: Number(price) }),
      ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  return NextResponse.json(addOn);
}
```

### Task 4: Add-on service assignments route

**Files:**
- Create: `src/app/api/admin/add-ons/[id]/services/route.ts`

- [ ] **Step 1: Create the file**

This endpoint replaces all service assignments for an add-on in one call. The UI sends the full set of selected serviceIds.

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: addOnId } = await params;
  const body = await request.json();
  const { serviceIds } = body; // string[]

  // Verify add-on belongs to this client
  const addOn = await prisma.addOn.findFirst({
    where: { id: addOnId, clientId: session.clientId },
  });
  if (!addOn) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify all services belong to this client
  if (Array.isArray(serviceIds) && serviceIds.length > 0) {
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, clientId: session.clientId },
      select: { id: true },
    });
    if (services.length !== serviceIds.length) {
      return NextResponse.json({ error: "One or more services not found" }, { status: 400 });
    }
  }

  // Replace all assignments: delete existing, create new
  await prisma.$transaction([
    prisma.serviceAddOn.deleteMany({ where: { addOnId, clientId: session.clientId } }),
    ...(Array.isArray(serviceIds)
      ? serviceIds.map((serviceId: string, i: number) =>
          prisma.serviceAddOn.create({
            data: {
              clientId: session.clientId,
              addOnId,
              serviceId,
              displayOrder: i,
            },
          })
        )
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verify file compiles**

```bash
npx tsc --noEmit
```

Expected: No errors in this file.

- [ ] **Step 3: Commit chunk 2**

```bash
git add src/app/api/admin/add-ons/
git commit -m "feat: add admin API routes for add-ons"
```

---

## Chunk 3: Admin API — Coupons + Public Validate-Coupon

### Task 5: Coupons list + create route

**Files:**
- Create: `src/app/api/admin/coupons/route.ts`

- [ ] **Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    where: { clientId: session.clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(coupons);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { code, name, discountPercent, usageLimit, expiresAt, active } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (
    discountPercent === undefined ||
    isNaN(Number(discountPercent)) ||
    Number(discountPercent) <= 0 ||
    Number(discountPercent) > 100
  ) {
    return NextResponse.json({ error: "discountPercent must be between 1 and 100" }, { status: 400 });
  }

  const upperCode = String(code).trim().toUpperCase();

  // Check uniqueness per client
  const existing = await prisma.coupon.findFirst({
    where: { clientId: session.clientId, code: upperCode },
  });
  if (existing) {
    return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      clientId: session.clientId,
      code: upperCode,
      name: name.trim(),
      discountPercent: Number(discountPercent),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: active !== false,
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
```

### Task 6: Coupon single-resource route (GET + PATCH)

**Files:**
- Create: `src/app/api/admin/coupons/[id]/route.ts`

- [ ] **Step 1: Create the file**

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

  const { id } = await params;
  const coupon = await prisma.coupon.findFirst({
    where: { id, clientId: session.clientId },
  });

  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(coupon);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.coupon.findFirst({
    where: { id, clientId: session.clientId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, discountPercent, usageLimit, expiresAt, active } = body;

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(discountPercent !== undefined && { discountPercent: Number(discountPercent) }),
      ...(usageLimit !== undefined && { usageLimit: usageLimit ? Number(usageLimit) : null }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  return NextResponse.json(coupon);
}
```

### Task 7: Public validate-coupon route

**Files:**
- Create: `src/app/api/booking/validate-coupon/route.ts`

- [ ] **Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, code, subtotal } = body;

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }
    if (subtotal === undefined || isNaN(Number(subtotal))) {
      return NextResponse.json({ error: "subtotal is required" }, { status: 400 });
    }

    const upperCode = String(code).trim().toUpperCase();

    const coupon = await prisma.coupon.findFirst({
      where: { clientId, code: upperCode, active: true },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid promo code" });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This promo code has expired" });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "This promo code has reached its usage limit" });
    }

    const sub = Number(subtotal);
    const discountAmount = parseFloat((sub * (Number(coupon.discountPercent) / 100)).toFixed(2));
    const newTotal = parseFloat((sub - discountAmount).toFixed(2));

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      discountPercent: Number(coupon.discountPercent),
      discountAmount,
      newTotal,
    });
  } catch (error) {
    console.error("validate-coupon error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
```

**Note on rate limiting:** The `validate-coupon` endpoint is public and unauthenticated. Rate limiting (e.g., via Vercel Edge middleware or `@upstash/ratelimit`) should be applied before deploying to production to prevent brute-force code enumeration. This is deferred from the current plan scope but must be added before launch.

- [ ] **Step 2: Commit chunk 3**

```bash
git add src/app/api/admin/coupons/ src/app/api/booking/
git commit -m "feat: add admin coupon routes and public validate-coupon endpoint"
```

---

## Chunk 4: Booking Engine Updates

### Task 8: Update availability lib to accept add-on duration

**Files:**
- Modify: `src/lib/availability.ts`

The `getAvailableSlots` and `isSlotAvailable` functions currently compute total slot duration from `service.durationMinutes`. Add an optional `addOnDurationMinutes` param that, when provided, is added to service duration.

- [ ] **Step 1: Update `GetAvailableSlotsParams` interface**

Add `addOnDurationMinutes?: number` to the interface at line 6.

Before:
```ts
export interface GetAvailableSlotsParams {
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD in client timezone
}
```

After:
```ts
export interface GetAvailableSlotsParams {
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD in client timezone
  addOnDurationMinutes?: number;
}
```

- [ ] **Step 2: Update `getAvailableSlots` to use addOnDurationMinutes**

Add `extraMinutes` just before the `for (const rule of rules)` loop (around line 81 of the current file). The existing `totalMinutes` variable is unused dead code — do not modify it.

Add this line before the `for` loop:
```ts
const extraMinutes = params.addOnDurationMinutes ?? 0;
```

Inside the `for (const rule of rules)` loop, find the line:
```ts
const blockEnd = addMinutes(candidateUtc, service.durationMinutes + service.bufferAfterMinutes);
```

Change to:
```ts
const blockEnd = addMinutes(candidateUtc, service.durationMinutes + extraMinutes + service.bufferAfterMinutes);
```

- [ ] **Step 3: Update `IsSlotAvailableParams` interface**

Add `addOnDurationMinutes?: number` to the interface at line 11.

Before:
```ts
export interface IsSlotAvailableParams {
  clientId: string;
  serviceId: string;
  startTimeUtc: Date;
}
```

After:
```ts
export interface IsSlotAvailableParams {
  clientId: string;
  serviceId: string;
  startTimeUtc: Date;
  addOnDurationMinutes?: number;
}
```

- [ ] **Step 4: Update `isSlotAvailable` to use addOnDurationMinutes**

The current lines:
```ts
const blockStart = addMinutes(startTimeUtc, -service.bufferBeforeMinutes);
const blockEnd = addMinutes(startTimeUtc, service.durationMinutes + service.bufferAfterMinutes);
```

Change to:
```ts
const extraMinutes = params.addOnDurationMinutes ?? 0;
const blockStart = addMinutes(startTimeUtc, -service.bufferBeforeMinutes);
const blockEnd = addMinutes(startTimeUtc, service.durationMinutes + extraMinutes + service.bufferAfterMinutes);
```

- [ ] **Step 5: Verify no type errors**

```bash
npx tsc --noEmit
```

Expected: No errors.

### Task 9: Update slots route to accept addOnIds

**Files:**
- Modify: `src/app/api/bookings/slots/route.ts`

- [ ] **Step 1: Replace the entire file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, serviceId, date, addOnIds } = body;

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }
    if (!serviceId || typeof serviceId !== "string") {
      return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
    }
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "date is required in YYYY-MM-DD format" }, { status: 400 });
    }

    // Compute total add-on duration
    let addOnDurationMinutes = 0;
    if (Array.isArray(addOnIds) && addOnIds.length > 0) {
      const addOns = await prisma.addOn.findMany({
        where: { id: { in: addOnIds }, clientId, active: true },
        select: { durationMinutes: true },
      });
      addOnDurationMinutes = addOns.reduce((sum, a) => sum + a.durationMinutes, 0);
    }

    const slots = await getAvailableSlots({ clientId, serviceId, date, addOnDurationMinutes });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
  }
}
```

### Task 10: Update booking creation route

**Files:**
- Modify: `src/app/api/bookings/route.ts`

The booking creation route needs to accept `selectedAddOnIds` and `couponCode`, compute pricing, snapshot add-on data, handle coupon in the transaction.

- [ ] **Step 1: Update the `BookingRequestBody` interface**

Replace the interface at the top:

```ts
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
  selectedAddOnIds?: string[];
  couponCode?: string;
}
```

- [ ] **Step 2: Replace the `POST` handler body**

The complete updated `POST` function:

```ts
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequestBody = await request.json();

    const validationError = validateBookingInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const {
      clientId,
      serviceId,
      startTimeUtc: startTimeStr,
      customer,
      formAnswers = [],
      selectedAddOnIds = [],
      couponCode,
    } = body;

    const startTimeUtc = new Date(startTimeStr);
    if (isNaN(startTimeUtc.getTime())) {
      return NextResponse.json({ error: "startTimeUtc must be a valid ISO date string" }, { status: 400 });
    }

    const formError = await validateFormSubmissions(serviceId, formAnswers);
    if (formError) {
      return NextResponse.json({ error: formError }, { status: 400 });
    }

    // Fetch add-ons (outside transaction — read-only pre-check)
    const selectedAddOns = selectedAddOnIds.length > 0
      ? await prisma.addOn.findMany({
          where: { id: { in: selectedAddOnIds }, clientId, active: true },
        })
      : [];

    if (selectedAddOns.length !== selectedAddOnIds.length) {
      return NextResponse.json({ error: "One or more add-ons are unavailable" }, { status: 400 });
    }

    const addOnDurationMinutes = selectedAddOns.reduce((sum, a) => sum + a.durationMinutes, 0);

    const result = await prisma.$transaction(async (tx: any) => {
      const available = await isSlotAvailable(
        { clientId, serviceId, startTimeUtc, addOnDurationMinutes },
        tx
      );
      if (!available) return { conflict: true } as const;

      const service = await tx.service.findFirstOrThrow({
        where: { id: serviceId, clientId, active: true },
      });

      // Validate and lock coupon inside transaction
      let coupon: any = null;
      if (couponCode) {
        const upperCode = String(couponCode).trim().toUpperCase();
        coupon = await tx.coupon.findFirst({
          where: { clientId, code: upperCode, active: true },
        });
        if (!coupon) return { conflict: false, couponInvalid: true } as const;
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          return { conflict: false, couponInvalid: true } as const;
        }
        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
          return { conflict: false, couponInvalid: true } as const;
        }
      }

      // Compute pricing
      const servicePrice = Number(service.price);
      const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + Number(a.price), 0);
      const subtotal = servicePrice + addOnsTotal;
      const discountAmount = coupon
        ? parseFloat((subtotal * (Number(coupon.discountPercent) / 100)).toFixed(2))
        : 0;
      const totalAmount = parseFloat((subtotal - discountAmount).toFixed(2));

      // endTimeUtc stores service end time only (no buffers — consistent with existing codebase).
      // Buffers are accounted for in availability checks, not in the stored booking record.
      const endTimeUtc = addMinutes(
        startTimeUtc,
        service.durationMinutes + addOnDurationMinutes
      );

      // Upsert customer
      let existingCustomer = await tx.customer.findFirst({
        where: { clientId, email: customer.email },
      });
      if (existingCustomer) {
        existingCustomer = await tx.customer.update({
          where: { id: existingCustomer.id },
          data: { fullName: customer.fullName, phone: customer.phone, notes: customer.notes },
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

      const manageToken = crypto.randomUUID();

      const booking = await tx.booking.create({
        data: {
          clientId,
          serviceId,
          customerId: existingCustomer.id,
          startTimeUtc,
          endTimeUtc,
          status: "PENDING_PAYMENT",
          paymentStatus: "UNPAID",
          manageToken,
          couponId: coupon?.id ?? null,
          discountAmount: discountAmount > 0 ? discountAmount : null,
          addOnsTotalAmount: addOnsTotal > 0 ? addOnsTotal : null,
          totalAmount,
        },
      });

      // Snapshot add-ons
      for (const addOn of selectedAddOns) {
        await tx.bookingAddOn.create({
          data: {
            clientId,
            bookingId: booking.id,
            addOnId: addOn.id,
            name: addOn.name,
            price: Number(addOn.price),
            durationMinutes: addOn.durationMinutes,
          },
        });
      }

      // Form submissions
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

      // Increment coupon usage
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      return {
        conflict: false,
        couponInvalid: false,
        bookingId: booking.id,
        manageToken,
        servicePrice,
        serviceDepositAmount: service.depositAmount ? Number(service.depositAmount) : null,
        paymentType: service.paymentType,
        totalAmount,
      } as const;
    });

    if (result.conflict) {
      return NextResponse.json({ error: "Time slot is no longer available" }, { status: 409 });
    }
    if ("couponInvalid" in result && result.couponInvalid) {
      return NextResponse.json({ error: "Promo code is no longer valid" }, { status: 400 });
    }

    // chargeAmount: for DEPOSIT, always service.depositAmount; for FULL, totalAmount
    const chargeAmount =
      result.paymentType === "DEPOSIT" && result.serviceDepositAmount
        ? result.serviceDepositAmount
        : result.totalAmount;

    return NextResponse.json(
      { bookingId: result.bookingId, manageToken: result.manageToken, chargeAmount },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating booking:", error);
    const msg = error?.message ?? String(error);
    return NextResponse.json({ error: `Failed to create booking: ${msg}` }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

### Task 11: Update Square charge route to use booking.totalAmount

**Files:**
- Modify: `src/app/api/payments/square/route.ts`

The charge amount calculation currently recomputes from `service.price`/`depositAmount`. It must now use the pre-computed `booking.totalAmount` (for FULL) or `service.depositAmount` (for DEPOSIT).

- [ ] **Step 1: Update the booking fetch to include new fields**

Find the `prisma.booking.findUnique` call. In its `include.service.select`, the existing fields are:
```ts
service: { select: { name: true, price: true, depositAmount: true, paymentType: true, durationMinutes: true } },
```

No changes needed here — `depositAmount` and `paymentType` are already selected.

- [ ] **Step 2: Replace the chargeAmount calculation**

Find and replace:
```ts
const chargeAmount =
  booking.service.paymentType === "DEPOSIT" && booking.service.depositAmount
    ? Number(booking.service.depositAmount)
    : Number(booking.service.price);
```

Replace with:
```ts
// For DEPOSIT: charge the fixed deposit amount only (add-ons collected after appointment)
// For FULL: charge the pre-computed totalAmount which includes add-ons minus any discount
const chargeAmount =
  booking.service.paymentType === "DEPOSIT" && booking.service.depositAmount
    ? Number(booking.service.depositAmount)
    : booking.totalAmount !== null && booking.totalAmount !== undefined
    ? Number(booking.totalAmount)
    : Number(booking.service.price);
```

Note: The Square route uses `findUnique` with `include:` (not `select:`), so `booking.totalAmount` is available automatically after the schema migration — no query change is needed. TypeScript may show a type error until `prisma generate` is run (Task 1, Step 3).

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit chunk 4**

```bash
git add src/lib/availability.ts src/app/api/bookings/ src/app/api/payments/
git commit -m "feat: update booking engine to support add-ons and coupons"
```

---

## Chunk 5: Public Add-ons API Route

### Task 12: Public route to fetch add-ons for a service

**Files:**
- Create: `src/app/api/services/[serviceId]/add-ons/route.ts`

This mirrors the existing `src/app/api/services/[serviceId]/forms/route.ts` pattern. It's called from the booking flow when a service is selected.

- [ ] **Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  // Resolve clientId from the service to satisfy the "scope all queries by clientId" rule
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { clientId: true },
  });
  if (!service) return NextResponse.json([]);

  const serviceAddOns = await prisma.serviceAddOn.findMany({
    where: {
      serviceId,
      clientId: service.clientId,
      addOn: { active: true },
    },
    include: {
      addOn: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          durationMinutes: true,
        },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  const addOns = serviceAddOns.map((sa) => ({
    id: sa.addOn.id,
    name: sa.addOn.name,
    description: sa.addOn.description,
    price: Number(sa.addOn.price),
    durationMinutes: sa.addOn.durationMinutes,
  }));

  return NextResponse.json(addOns);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/services/[serviceId]/add-ons/
git commit -m "feat: add public API route for service add-ons"
```

---

## Chunk 6: Admin UI — Add-ons Section + Coupons Page + Sidebar

### Task 13: Add Add-ons section to Services admin page

**Files:**
- Modify: `src/app/admin/(dashboard)/services/page.tsx`

Add an `AddOnsSection` component below the services list. The file already follows a pattern of inline sub-components (see `AssignedForms`).

Note: `services/page.tsx` already starts with `"use client"` and already imports `useState, useEffect` from `'react'` — no changes needed to the directive or imports.

- [ ] **Step 1: Add the `AddOnsSection` component and hook it up**

At the bottom of `src/app/admin/(dashboard)/services/page.tsx`, add the following component (after the closing brace of `AssignedForms`):

```tsx
// ─── Add-ons Section ─────────────────────────────────────────────────────────

interface AddOn {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  active: boolean;
  serviceAddOns: { serviceId: string; service: { name: string } }[];
}

interface AddOnForm {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  active: boolean;
  serviceIds: string[];
}

const emptyAddOnForm: AddOnForm = {
  name: "",
  description: "",
  price: "",
  durationMinutes: "0",
  active: true,
  serviceIds: [],
};

export function AddOnsSection({ services }: { services: { id: string; name: string }[] }) {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddOnForm>(emptyAddOnForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchAddOns() {
    const res = await fetch("/api/admin/add-ons");
    if (res.ok) setAddOns(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchAddOns();
  }, []);

  function updateForm(field: keyof AddOnForm, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleService(serviceId: string) {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  }

  function startEdit(addOn: AddOn) {
    setEditingId(addOn.id);
    setForm({
      name: addOn.name,
      description: addOn.description ?? "",
      price: String(addOn.price),
      durationMinutes: String(addOn.durationMinutes),
      active: addOn.active,
      serviceIds: addOn.serviceAddOns.map((sa) => sa.serviceId),
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyAddOnForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
      active: form.active,
    };

    const url = editingId ? `/api/admin/add-ons/${editingId}` : "/api/admin/add-ons";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }

    const saved = await res.json();
    const addOnId = saved.id ?? editingId;

    // Save service assignments
    await fetch(`/api/admin/add-ons/${addOnId}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceIds: form.serviceIds }),
    });

    resetForm();
    fetchAddOns();
  }

  async function handleToggleActive(addOn: AddOn) {
    await fetch(`/api/admin/add-ons/${addOn.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !addOn.active }),
    });
    fetchAddOns();
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-light)]">Loading add-ons…</p>;
  }

  return (
    <div className="mt-10 border-t border-[var(--color-border)] pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[var(--color-text)]">Add-ons</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add Add-on</Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-6"
        >
          <p className="mb-4 text-sm font-medium text-[var(--color-text)]">
            {editingId ? "Edit Add-on" : "New Add-on"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="aoName">Name *</Label>
              <Input
                id="aoName"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="aoPrice">Price ($) *</Label>
              <Input
                id="aoPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="aoDesc">Description</Label>
              <Textarea
                id="aoDesc"
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="aoDuration">Duration added (minutes)</Label>
              <Input
                id="aoDuration"
                type="number"
                min="0"
                value={form.durationMinutes}
                onChange={(e) => updateForm("durationMinutes", e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="aoActive"
                type="checkbox"
                checked={form.active}
                onChange={(e) => updateForm("active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="aoActive">Active</Label>
            </div>

            <div className="sm:col-span-2">
              <Label>Applies to services</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {services.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={form.serviceIds.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-[var(--color-text)]">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="submit">{editingId ? "Update Add-on" : "Create Add-on"}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {addOns.map((addOn) => (
          <div
            key={addOn.id}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--color-text)]">{addOn.name}</p>
                {!addOn.active && <Badge variant="outline">Inactive</Badge>}
              </div>
              <p className="text-xs text-[var(--color-text-light)]">
                ${Number(addOn.price).toFixed(2)}
                {addOn.durationMinutes > 0 && ` · +${addOn.durationMinutes} min`}
                {addOn.serviceAddOns.length > 0 &&
                  ` · ${addOn.serviceAddOns.map((sa) => sa.service.name).join(", ")}`}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => startEdit(addOn)}>Edit</Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleActive(addOn)}
              >
                {addOn.active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
        {addOns.length === 0 && (
          <p className="text-sm text-[var(--color-text-light)]">No add-ons yet.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount AddOnsSection inside ServicesPage**

In the `ServicesPage` function, after the closing `</div>` of the service list section (just before the final `</div>` of the returned JSX), add:

```tsx
<AddOnsSection services={services.map((s) => ({ id: s.id, name: s.name }))} />
```

### Task 14: Create Coupons admin page

**Files:**
- Create: `src/app/admin/(dashboard)/coupons/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  name: string;
  discountPercent: string;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

interface CouponForm {
  code: string;
  name: string;
  discountPercent: string;
  usageLimit: string;
  expiresAt: string;
  active: boolean;
}

const emptyForm: CouponForm = {
  code: "",
  name: "",
  discountPercent: "",
  usageLimit: "",
  expiresAt: "",
  active: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchCoupons() {
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  function updateForm(field: keyof CouponForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      name: coupon.name,
      discountPercent: String(coupon.discountPercent),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      active: coupon.active,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      code: form.code,
      name: form.name,
      discountPercent: Number(form.discountPercent),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
      active: form.active,
    };

    const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchCoupons();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function handleToggleActive(coupon: Coupon) {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    fetchCoupons();
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-light)]">Loading…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">Coupons</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Create Coupon</Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-6"
        >
          <p className="mb-4 text-sm font-medium text-[var(--color-text)]">
            {editingId ? "Edit Coupon" : "New Coupon"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cpCode">Code *</Label>
              <Input
                id="cpCode"
                value={form.code}
                onChange={(e) => updateForm("code", e.target.value.toUpperCase())}
                placeholder="SUMMER20"
                required
                disabled={!!editingId}
                className="mt-1 font-mono uppercase"
              />
              <p className="mt-1 text-xs text-[var(--color-text-light)]">Uppercase only. Cannot be changed after creation.</p>
            </div>

            <div>
              <Label htmlFor="cpName">Label *</Label>
              <Input
                id="cpName"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Summer 2026 Promo"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cpDiscount">Discount % *</Label>
              <Input
                id="cpDiscount"
                type="number"
                min="1"
                max="100"
                step="0.01"
                value={form.discountPercent}
                onChange={(e) => updateForm("discountPercent", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cpLimit">Usage Limit</Label>
              <Input
                id="cpLimit"
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) => updateForm("usageLimit", e.target.value)}
                placeholder="Unlimited"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cpExpiry">Expiry Date</Label>
              <Input
                id="cpExpiry"
                type="date"
                value={form.expiresAt}
                onChange={(e) => updateForm("expiresAt", e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="cpActive"
                type="checkbox"
                checked={form.active}
                onChange={(e) => updateForm("active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="cpActive">Active</Label>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="submit">{editingId ? "Update Coupon" : "Create Coupon"}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wide text-[var(--color-text-light)]">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Uses</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-white">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-4 py-3 font-mono font-medium text-[var(--color-text)]">{coupon.code}</td>
                <td className="px-4 py-3 text-[var(--color-text-light)]">{coupon.name}</td>
                <td className="px-4 py-3 text-[var(--color-text)]">{Number(coupon.discountPercent).toFixed(0)}%</td>
                <td className="px-4 py-3 text-[var(--color-text-light)]">
                  {coupon.usageCount} / {coupon.usageLimit ?? "∞"}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-light)]">
                  {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Never"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={coupon.active ? "default" : "outline"}>
                    {coupon.active ? "Active" : "Disabled"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(coupon)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleToggleActive(coupon)}>
                      {coupon.active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-light)]">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Task 15: Update sidebar navigation

**Files:**
- Modify: `src/app/admin/(dashboard)/sidebar.tsx`

- [ ] **Step 1: Add Coupons import and remove Categories**

At the top of the file, the existing imports include `IconSparkles` etc. Add `IconTag` to the import list:

```ts
import {
  IconLayoutDashboard,
  IconCalendar,
  IconClipboardList,
  IconUsers,
  IconSparkles,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconClock,
  IconReportAnalytics,
  IconBell,
  IconTag,
} from "@tabler/icons-react";
```

- [ ] **Step 2: Add Coupons to navItems**

In the `navItems` array, add after the Services entry:

```ts
{ href: "/admin/coupons", label: "Coupons", icon: IconTag },
```

The Categories nav item does not currently exist in the sidebar (it was never added), so no removal needed. Verify by checking current `navItems` — it only has Dashboard, Calendar, Appointments, Clients, Services, Analytics, Reports.

- [ ] **Step 3: Commit chunk 6**

```bash
git add src/app/admin/(dashboard)/services/page.tsx src/app/admin/(dashboard)/coupons/page.tsx src/app/admin/(dashboard)/sidebar.tsx
git commit -m "feat: add add-ons section to services, coupons admin page, update sidebar"
```

---

## Chunk 7: Booking Flow UI

### Task 16: Update book-selection.tsx

**Files:**
- Modify: `src/app/[clientSlug]/book/book-selection.tsx`

This is the main booking flow. Changes:
1. Remove category filter tabs from Step 1 — show all services grouped by category section headers
2. Add Step 2 (Add-ons) between service selection and date/time
3. Renumber existing steps: Date/Time becomes step 3, Your Info becomes step 4, Payment becomes step 5
4. Add coupon field to Step 4 (Your Info) — **not** the payment step, because the booking is created when info is submitted, so the coupon must be sent with that request
5. Update slot fetching to pass `addOnIds`
6. Update booking submission to pass `selectedAddOnIds` and `couponCode`
7. Update `handleGoTo`, `Sidebar`, and mobile bar to handle the new step numbering

- [ ] **Step 1: Add add-on types**

At the top of the file, after the `ServiceForm` interface, add:

```ts
interface AddOn {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
}
```

- [ ] **Step 2: Update STEPS array and StepIndicator**

Replace:
```ts
const STEPS = ["Service", "Date & Time", "Your Info", "Payment"];
```
With:
```ts
const STEPS_WITHOUT_ADDONS = ["Service", "Date & Time", "Your Info", "Payment"];
const STEPS_WITH_ADDONS    = ["Service", "Add-ons", "Date & Time", "Your Info", "Payment"];
```

Update `StepIndicator` to accept a `steps` prop instead of using the constant:

Replace:
```ts
function StepIndicator({
  current,
  onGoTo,
}: {
  current: 1 | 2 | 3 | 4;
  onGoTo: (n: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((label, i) => {
```

With:
```ts
function StepIndicator({
  current,
  steps,
  onGoTo,
}: {
  current: number;
  steps: string[];
  onGoTo: (n: any) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((label, i) => {
```

Also in `StepIndicator`, replace every reference to `1 | 2 | 3 | 4` cast with plain `number`.

- [ ] **Step 3: Update Step1Service to remove category tabs**

Replace the entire `Step1Service` function:

```tsx
function Step1Service({ categories, onSelect }: { categories: Category[]; onSelect: (s: Service) => void }) {
  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-[#1a1814]">Select your service</h2>
      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          {categories.length > 1 && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9a9890]">
              {cat.name}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {cat.services.map((service) => (
              <button
                key={service.id}
                onClick={() => onSelect(service)}
                className="group flex flex-col items-start rounded-2xl border border-[#e8e6e1] bg-white p-5 text-left transition-all hover:border-[#C9A96E] hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <p className="text-[14px] font-semibold text-[#1a1814]">{service.name}</p>
                  <span className="shrink-0 text-[14px] font-bold text-[#1a1814]">
                    ${service.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[#9a9890]">{formatDuration(service.durationMinutes)}</p>
                {service.description && (
                  <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#9a9890]">
                    {service.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Add Step2AddOns component**

Add this new component after the `Step1Service` function:

```tsx
function Step2AddOns({
  addOns,
  selectedIds,
  onToggle,
  onContinue,
  serviceName,
  servicePrice,
}: {
  addOns: AddOn[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
  serviceName: string;
  servicePrice: number;
}) {
  const selectedAddOns = addOns.filter((a) => selectedIds.includes(a.id));
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const total = servicePrice + addOnsTotal;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-[#1a1814]">Add-ons</h2>
      <p className="mb-5 text-[13px] text-[#9a9890]">
        Enhance your {serviceName} with optional extras
      </p>

      <div className="space-y-3">
        {addOns.map((addOn) => {
          const selected = selectedIds.includes(addOn.id);
          return (
            <button
              key={addOn.id}
              type="button"
              onClick={() => onToggle(addOn.id)}
              className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? "border-[#C9A96E] bg-[#fdfaf5] shadow-sm"
                  : "border-[#e8e6e1] bg-white hover:border-[#C9A96E]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    selected
                      ? "border-[#C9A96E] bg-[#C9A96E]"
                      : "border-[#e8e6e1]"
                  }`}
                >
                  {selected && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1814]">{addOn.name}</p>
                  {addOn.description && (
                    <p className="mt-0.5 text-[12px] text-[#9a9890]">{addOn.description}</p>
                  )}
                  {addOn.durationMinutes > 0 && (
                    <p className="mt-0.5 text-[11px] text-[#9a9890]">+{addOn.durationMinutes} min</p>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-[14px] font-bold text-[#1a1814]">
                +${addOn.price.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>

      {selectedAddOns.length > 0 && (
        <div className="mt-4 rounded-xl bg-[#f9f8f6] px-4 py-3 text-[12px]">
          <div className="flex items-center justify-between text-[#6b6860]">
            <span>Service</span>
            <span>${servicePrice.toFixed(2)}</span>
          </div>
          {selectedAddOns.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-[#6b6860]">
              <span>{a.name}</span>
              <span>+${a.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-[#e8e6e1] pt-2 font-semibold text-[#1a1814]">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button
        onClick={onContinue}
        className="mt-6 w-full rounded-xl bg-[#C9A96E] py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#b8954f]"
      >
        {selectedAddOns.length > 0 ? "Continue with add-ons →" : "Continue without add-ons →"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Rename Step4Payment → Step5Payment; no coupon field needed there**

The existing `Step4Payment` function needs to be renamed to `Step5Payment`. No structural changes — the coupon is applied in Step 4 (Your Info), not here. The `chargeAmount` prop already reflects the post-discount amount because it comes from the server's booking creation response.

Find:
```tsx
function Step4Payment({ bookingId, clientSlug, chargeAmount }: {
  bookingId: string; clientSlug: string; chargeAmount: number;
}) {
```

Replace with:
```tsx
function Step5Payment({ bookingId, clientSlug, chargeAmount }: {
  bookingId: string; clientSlug: string; chargeAmount: number;
}) {
```

- [ ] **Step 5b: Add coupon field to Step3YourInfo (now shown at step 4)**

The coupon field goes in the Your Info step because the booking is created on info submission, and the coupon code must be sent with that request. The server re-validates and returns the correct `chargeAmount`.

Inside `Step3YourInfo`, add `couponState` and related props. Update the function signature to add:

```tsx
function Step3YourInfo({
  onSubmit, isSubmitting, error, businessSettings, serviceForms, formAnswers, onUpdateFormAnswer,
  clientId, serviceSubtotal,
}: {
  onSubmit: (info: CustomerInfo, couponCode?: string) => void;
  isSubmitting: boolean;
  error: string | null;
  businessSettings: BusinessSettings;
  serviceForms: ServiceForm[];
  formAnswers: FormAnswers;
  onUpdateFormAnswer: (formId: string, fieldId: string, value: string | boolean) => void;
  clientId: string;
  serviceSubtotal: number;
}) {
```

Add coupon state inside the component (before `handleSubmit`):

```tsx
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/booking/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, code: couponCode.trim(), subtotal: serviceSubtotal }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error ?? "Invalid code");
      } else {
        setCouponApplied(true);
        setCouponDiscount(data.discountAmount);
      }
    } catch {
      setCouponError("Failed to validate code");
    } finally {
      setCouponLoading(false);
    }
  }
```

Update `handleSubmit` to pass `couponCode` when valid:

```tsx
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(
      { ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), notes: form.notes.trim() },
      couponApplied ? couponCode.trim() : undefined
    );
  }
```

Add coupon UI inside the form JSX, just before the submit button:

```tsx
        {/* Promo code */}
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#1a1814]">
            Promo Code <span className="font-normal text-[#c0bdb8]">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={couponApplied}
              placeholder="Enter code"
              className="flex-1 rounded-xl border border-[#e8e6e1] px-4 py-2.5 font-mono text-[13px] uppercase text-[#1a1814] outline-none placeholder:normal-case placeholder:text-[#c0bdb8] focus:border-[#C9A96E] disabled:bg-[#f9f8f6]"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponApplied || !couponCode.trim() || couponLoading}
              className="rounded-xl bg-[#1a1814] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2d2925] disabled:opacity-40"
            >
              {couponApplied ? "Applied ✓" : couponLoading ? "…" : "Apply"}
            </button>
          </div>
          {couponError && <p className="mt-1 text-[11px] text-red-500">{couponError}</p>}
          {couponApplied && (
            <p className="mt-1 text-[11px] text-green-600">
              -{couponDiscount > 0 ? `$${couponDiscount.toFixed(2)} discount` : ""} applied
            </p>
          )}
        </div>
```

- [ ] **Step 6: Update main BookSelection state, handlers, Sidebar, and mobile bar**

**A. Add new state vars** (after existing state in `BookSelection`):

```tsx
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
```

**B. Change step type** from `1|2|3|4` to `1|2|3|4|5` in the `useState` call and `handleGoTo`:

```tsx
  const [step, setStep] = useState<1|2|3|4|5>(1);

  function handleGoTo(n: 1|2|3|4|5) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
```

**C. Add derived step-display helpers** (after state declarations):

```tsx
  const hasAddOns = availableAddOns.length > 0;
  const activeSteps = hasAddOns ? STEPS_WITH_ADDONS : STEPS_WITHOUT_ADDONS;

  // stepToDisplay returns 0-based index into activeSteps
  // Without add-ons: 1→0 (Service), 3→1 (Date), 4→2 (Info), 5→3 (Pay)
  // With add-ons:    1→0, 2→1, 3→2, 4→3, 5→4
  function stepToDisplay(s: number): number {
    if (hasAddOns) return s - 1;
    if (s === 1) return 0;
    if (s === 3) return 1;
    if (s === 4) return 2;
    return 3; // step 5
  }
```

**D. Update `handleSelectService`** to fetch add-ons:

```tsx
  async function handleSelectService(s: Service) {
    setService(s);
    setSlot(null);
    setSelectedDate(null);
    setSlots([]);
    setFormAnswers({});
    setSelectedAddOnIds([]);

    const [formsRes, addOnsRes] = await Promise.all([
      fetch(`/api/services/${s.id}/forms`).then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/services/${s.id}/add-ons`).then((r) => r.ok ? r.json() : []).catch(() => []),
    ]);

    setServiceForms(formsRes);
    setAvailableAddOns(addOnsRes);
    // Skip add-ons step if no add-ons assigned
    setStep(addOnsRes.length > 0 ? 2 : 3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
```

**E. Update slot-fetching `useEffect`** (fires on step 3, not step 2; passes addOnIds):

```tsx
  useEffect(() => {
    if (!selectedDate || !service || step !== 3) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setSlotsLoading(true);
    setSlots([]);
    fetch("/api/bookings/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, serviceId: service.id, date: dateStr, addOnIds: selectedAddOnIds }),
    })
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, service, clientId, step, selectedAddOnIds]);
```

**F. Rename `handleStep3Submit` → `handleStep4Submit`** and add `selectedAddOnIds` + `couponCode` param:

```tsx
  async function handleStep4Submit(info: CustomerInfo, couponCode?: string) {
    if (!service || !slot) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const formAnswersPayload = serviceForms.map((f) => ({
      formTemplateId: f.id,
      answers: formAnswers[f.id] ?? {},
    }));

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceId: service.id,
          startTimeUtc: slot,
          customer: { fullName: info.fullName, email: info.email, phone: info.phone, notes: info.notes || undefined },
          formAnswers: formAnswersPayload,
          selectedAddOnIds,
          couponCode: couponCode ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }
      setPendingBookingId(data.bookingId);
      setChargeAmount(data.chargeAmount);
      setIsSubmitting(false);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }
```

**G. Update `Sidebar` component** — fix step type and step-number references:

Find the `Sidebar` function's props interface:
```ts
  step: 1 | 2 | 3 | 4;
  ...
  onGoTo: (n: 1 | 2 | 3 | 4) => void;
```
Change to:
```ts
  step: number;
  ...
  onGoTo: (n: any) => void;
```

Inside `Sidebar`, find the Date & Time "Change" button:
```tsx
{slot && step > 2 && <button onClick={() => onGoTo(2)} ...>Change</button>}
```
Change to:
```tsx
{slot && step > 3 && <button onClick={() => onGoTo(3)} ...>Change</button>}
```

Inside `Sidebar`, find the slot-picker panel condition:
```tsx
{step === 2 && selectedDate && (
```
Change to:
```tsx
{step === 3 && selectedDate && (
```

**H. Update mobile sticky bar threshold**:

Find:
```tsx
{service && step < 3 && (
```
Change to:
```tsx
{service && step < 4 && (
```

- [ ] **Step 7: Update main JSX render**

Replace the entire `return (...)` block inside `BookSelection`. Use the existing structure as a guide (see current file lines 1002–1110) and apply these changes:

**StepIndicator call** — replace:
```tsx
<StepIndicator current={step} onGoTo={handleGoTo} />
```
With:
```tsx
<StepIndicator
  current={stepToDisplay(step) + 1}
  steps={activeSteps}
  onGoTo={(displayN: number) => {
    if (hasAddOns) {
      handleGoTo(displayN as 1 | 2 | 3 | 4 | 5);
    } else {
      // Without add-ons: display 1→step 1, 2→step 3, 3→step 4, 4→step 5
      const map: Record<number, number> = { 1: 1, 2: 3, 3: 4, 4: 5 };
      handleGoTo((map[displayN] ?? displayN) as 1 | 2 | 3 | 4 | 5);
    }
  }}
/>
```

**Left panel step renders** — replace the existing `{step === 1 && ...}` through `{step === 4 && ...}` blocks with:

```tsx
{step === 1 && <Step1Service categories={categories} onSelect={handleSelectService} />}

{step === 2 && service && hasAddOns && (
  <>
    <div className="mb-5 flex items-center gap-2">
      <button onClick={() => handleGoTo(1)} className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      <span className="text-[#e8e6e1]">·</span>
      <span className="text-[12px] font-medium text-[#1a1814]">{service.name}</span>
    </div>
    <Step2AddOns
      addOns={availableAddOns}
      selectedIds={selectedAddOnIds}
      onToggle={(id) => setSelectedAddOnIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      )}
      onContinue={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      serviceName={service.name}
      servicePrice={service.price}
    />
  </>
)}

{step === 3 && service && (
  <>
    <div className="mb-5 flex items-center gap-2">
      <button onClick={() => handleGoTo(hasAddOns ? 2 : 1)} className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      <span className="text-[#e8e6e1]">·</span>
      <span className="text-[12px] font-medium text-[#1a1814]">{service.name}</span>
      <span className="ml-auto rounded-full bg-[#f5f4f2] px-2.5 py-0.5 text-[11px] text-[#6b6860]">
        {formatDuration(service.durationMinutes)} · ${service.price.toFixed(2)}
      </span>
    </div>
    <Step2Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} slots={slots} slotsLoading={slotsLoading} timezone={timezone} onSelectSlot={handleSelectSlot} />
  </>
)}

{step === 4 && (
  <>
    <div className="mb-5 flex items-center gap-2">
      <button onClick={() => handleGoTo(3)} className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      {slot && (
        <>
          <span className="text-[#e8e6e1]">·</span>
          <span className="text-[12px] text-[#6b6860]">
            {format(toZonedTime(new Date(slot), timezone), "EEE, MMM d")} at {formatSlotTime(slot, timezone)}
          </span>
        </>
      )}
    </div>
    <Step3YourInfo
      onSubmit={handleStep4Submit}
      isSubmitting={isSubmitting}
      error={submitError}
      businessSettings={businessSettings}
      serviceForms={serviceForms}
      formAnswers={formAnswers}
      onUpdateFormAnswer={handleUpdateFormAnswer}
      clientId={clientId}
      serviceSubtotal={
        service
          ? Number(service.price) +
            availableAddOns
              .filter((a) => selectedAddOnIds.includes(a.id))
              .reduce((s, a) => s + a.price, 0)
          : 0
      }
    />
  </>
)}

{step === 5 && pendingBookingId && (
  <>
    <div className="mb-5 flex items-center gap-2">
      <button
        onClick={() => { handleGoTo(4); setSubmitError(null); }}
        className="flex items-center gap-1 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      {slot && (
        <>
          <span className="text-[#e8e6e1]">·</span>
          <span className="text-[12px] text-[#6b6860]">
            {format(toZonedTime(new Date(slot), timezone), "EEE, MMM d")} at {formatSlotTime(slot, timezone)}
          </span>
        </>
      )}
    </div>
    <Step5Payment bookingId={pendingBookingId} clientSlug={clientSlug} chargeAmount={chargeAmount} />
  </>
)}
```

**Sidebar call** — replace:
```tsx
<Sidebar step={step} service={service} slot={slot} timezone={timezone} slots={slots} slotsLoading={slotsLoading} selectedDate={selectedDate} onGoTo={handleGoTo} onSelectSlot={handleSelectSlot} />
```
With the same call — no change needed here since `handleGoTo` type was already updated in Step 6B and the `Sidebar` props interface was updated in Step 6G.

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors. Fix any type issues surfaced.

- [ ] **Step 9: Commit chunk 7**

```bash
git add src/app/[clientSlug]/book/ src/app/api/services/
git commit -m "feat: add add-ons step and coupon field to booking flow, remove category tabs"
```

---

## Chunk 8: Final Verification

### Task 17: End-to-end smoke test

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Expected: Server starts without errors.

- [ ] **Step 2: Test admin add-on creation**

1. Log in at `/admin/login`
2. Navigate to Services
3. Scroll to Add-ons section
4. Create an add-on (e.g., "Eyebrow Wax", $15, 15 min)
5. Assign it to a service
6. Verify it appears in the list

- [ ] **Step 3: Test admin coupon creation**

1. Navigate to Coupons in sidebar
2. Create a coupon (e.g., code: "TEST10", 10% discount)
3. Verify it appears in the table

- [ ] **Step 4: Test booking flow with add-ons**

1. Navigate to `/{clientSlug}/book`
2. Select a service that has add-ons assigned
3. Verify Add-ons step appears
4. Select an add-on, verify running total updates
5. Continue to Date/Time — verify slots load
6. Complete through to payment, verify charge amount includes add-on

- [ ] **Step 5: Test booking flow without add-ons**

1. Select a service with no add-ons
2. Verify Add-ons step is skipped (goes directly to Date/Time)

- [ ] **Step 6: Test coupon at Your Info step**

1. Complete booking through to the Your Info step (step 4)
2. Enter coupon code "TEST10" in the promo code field and click Apply
3. Verify the discount confirmation message appears ("$X.XX discount applied")
4. Submit the form — verify the Payment screen's pay button shows the discounted charge amount

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: Phase 1 complete — add-ons and coupons"
```
