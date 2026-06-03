# Phase 1: Add-ons + Coupons — Design Spec

**Date:** 2026-06-02  
**Last updated:** 2026-06-03  
**Status:** Approved  
**Scope:** Admin portal + booking flow

---

## Overview

Phase 1 of the post-MVP commerce expansion. Adds two customer-facing features:

1. **Add-ons** — optional extras clients pick during booking (Acuity-style)
2. **Coupons** — admin-generated % discount codes entered at checkout

---

## Data Models

### New tables

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
  name            String          // snapshot — preserve historical name
  price           Decimal @db.Decimal(10, 2) // snapshot
  durationMinutes Int     @default(0)        // snapshot — needed for rescheduling

  client  Client  @relation(fields: [clientId], references: [id])
  booking Booking @relation(fields: [bookingId], references: [id])
  addOn   AddOn   @relation(fields: [addOnId], references: [id])

  @@index([clientId])
  @@index([bookingId])
}

model Coupon {
  id              String    @id @default(uuid())
  clientId        String
  code            String    // stored uppercase, unique per client
  name            String    // admin-facing label only
  discountPercent Decimal   @db.Decimal(5, 2)
  usageLimit      Int?      // null = unlimited
  usageCount      Int       @default(0)
  expiresAt       DateTime? // null = never expires
  active          Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  client   Client    @relation(fields: [clientId], references: [id])
  bookings Booking[]

  @@unique([clientId, code])
  @@index([clientId])
}
```

### Client model back-relations (required additions)

```prisma
addOns        AddOn[]
serviceAddOns ServiceAddOn[]
bookingAddOns BookingAddOn[]
coupons       Coupon[]
```

### Service model back-relations (required additions)

```prisma
serviceAddOns ServiceAddOn[]
```

### Booking table additions

```prisma
couponId          String?
discountAmount    Decimal? @db.Decimal(10, 2) // dollar amount discounted (snapshot)
addOnsTotalAmount Decimal? @db.Decimal(10, 2) // total of selected add-ons (snapshot)
totalAmount       Decimal? @db.Decimal(10, 2) // final charged amount (snapshot)

coupon   Coupon?        @relation(fields: [couponId], references: [id])
addOns   BookingAddOn[]
```

---

## Pricing Logic

### Full payment

```ts
const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0)
const subtotal    = service.price + addOnsTotal
const discount    = coupon ? subtotal * (coupon.discountPercent / 100) : 0
const total       = subtotal - discount

// Charge Square: total
```

### Deposit payment

The deposit amount is fixed — it is always `service.depositAmount` regardless of which add-ons were selected. Add-ons are collected in the remaining balance after the appointment.

```ts
const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0)
const subtotal    = service.price + addOnsTotal
const discount    = coupon ? subtotal * (coupon.discountPercent / 100) : 0
const total       = subtotal - discount
const chargeNow   = service.depositAmount  // fixed — add-ons do not increase deposit

// Charge Square: chargeNow (service.depositAmount only)
// Remaining balance = total - chargeNow (collected after appointment)
```

All amounts are snapshotted on the `Booking` record (`addOnsTotalAmount`, `discountAmount`, `totalAmount`) at creation time. The Square charge route (`/api/payments/square/route.ts`) must be updated to use `booking.totalAmount` (full) or `service.depositAmount` (deposit) instead of `booking.service.price` directly.

---

## Duration & Availability

Add-ons may extend the appointment duration. This affects two places:

### 1. Slot availability API (`/api/bookings/slots`)

The slot-fetching request must include `addOnIds[]`. The API computes:

```ts
const addOnDuration = selectedAddOns.reduce((sum, a) => sum + a.durationMinutes, 0)
const totalDuration = service.durationMinutes + addOnDuration
```

`isSlotAvailable` receives `totalDuration` so slots too short for the service + add-ons are not offered.

### 2. Booking creation (`/api/bookings`)

```ts
const addOnDuration = selectedAddOns.reduce((sum, a) => sum + a.durationMinutes, 0)
endTimeUtc = addMinutes(
  startTimeUtc,
  service.durationMinutes + addOnDuration + service.bufferBeforeMinutes + service.bufferAfterMinutes
)
```

---

## Booking Flow

**Removed:** Category selection step — services are shown directly, optionally grouped by category visually.

**Updated flow:** Service → **Add-ons** → Date/Time → Customer Info → Payment

Add-ons are placed before Date/Time so the slot API can receive the full duration (service + add-ons).

### Step 1 — Service
- All services shown directly (no category gating)
- Can still be visually grouped by category name as section headers
- User selects a service

### Step 2 — Add-ons
- Shows add-ons assigned to the selected service
- Client selects 0 or more; running total and duration update live
- If no add-ons are assigned to the service, this step is skipped entirely
- Selected add-on IDs are carried into step 3

### Step 3 — Date/Time
- Slot API called with `serviceId` + `addOnIds[]`
- Available slots reflect total duration (service + add-ons)

### Step 5 — Payment
- Itemized breakdown: service price, each add-on line item, subtotal
- "Have a promo code?" input
- On code entry: `POST /api/booking/validate-coupon` validates the code
  - Checks: exists for clientId, active, not expired, usageCount < usageLimit
  - Returns: discountPercent, discountAmount, newTotal (no internal IDs)
- Coupon is re-validated at booking creation — not just at display time

---

## Coupon Redemption — Race Condition Guard

The validate-coupon endpoint only checks eligibility. Redemption happens inside the booking creation transaction:

```ts
await prisma.$transaction(async (tx) => {
  const coupon = await tx.coupon.findFirst({
    where: { id: couponId, active: true, clientId },
  })
  if (!coupon) throw new Error('Coupon no longer valid')
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached')
  }

  const booking = await tx.booking.create({ ... })

  await tx.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  })

  return booking
})
```

---

## Security

### validate-coupon endpoint
- Public (unauthenticated), returns minimal data (no internal IDs)
- Must have rate limiting (e.g., Vercel Edge middleware or `@upstash/ratelimit`) to prevent brute-force enumeration
- Scoped to `clientId` from the booking session — cannot probe other clients' codes

---

## Admin UI

### Services page (`/admin/services`) — updated

The existing Services admin page gains an **"Add-ons" tab or section** below the services list. No separate nav item or page.

**Add-ons section:**
- Table: name, price, duration added, assigned services, status
- Create / Edit / Toggle active actions

**Create/Edit add-on form (modal or inline):**
- Name (required)
- Description (optional)
- Price (required)
- Duration added in minutes (optional, default 0)
- Multi-select: which services this add-on applies to
- Active toggle

### Coupons page (`/admin/coupons`)

New page, new sidebar nav item.

**List view:**
- Table: code, name, discount %, uses (usageCount / usageLimit or "Unlimited"), expires, status
- Create / Edit / Disable actions (no delete — preserve history)

**Create/Edit form:**
- Code (required, unique per client, auto-uppercased on save)
- Name / label (required, admin-facing only)
- Discount % (required, 1–100)
- Usage limit (optional, blank = unlimited)
- Expiry date (optional)
- Active toggle

---

## Sidebar Navigation

- Remove **Categories** from sidebar nav (categories still exist in DB for service organization, just not a standalone admin page)
- Add **Coupons** nav item (icon: `IconTag`)
- No new nav item for Add-ons — managed within Services page

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/add-ons` | List add-ons for client |
| POST | `/api/admin/add-ons` | Create add-on |
| GET | `/api/admin/add-ons/[id]` | Fetch single add-on (edit form) |
| PATCH | `/api/admin/add-ons/[id]` | Update add-on |
| POST | `/api/admin/add-ons/[id]/services` | Update service assignments for an add-on |
| GET | `/api/admin/coupons` | List coupons for client |
| POST | `/api/admin/coupons` | Create coupon |
| GET | `/api/admin/coupons/[id]` | Fetch single coupon (edit form) |
| PATCH | `/api/admin/coupons/[id]` | Update/disable coupon |
| POST | `/api/booking/validate-coupon` | Validate code at checkout (public, rate-limited) |

---

## Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add AddOn, ServiceAddOn, BookingAddOn, Coupon; back-relations on Client/Service; new fields on Booking |
| `src/app/api/payments/square/route.ts` | Use `booking.totalAmount` (full) or `service.depositAmount` (deposit) instead of `service.price` |
| `src/app/api/bookings/route.ts` | Accept `selectedAddOnIds[]`, compute extended endTimeUtc, snapshot add-on data, coupon transaction guard |
| `src/lib/availability.ts` | Accept `totalDuration` param instead of reading only `service.durationMinutes` |
| `src/app/api/bookings/slots/route.ts` | Accept `addOnIds[]`, compute totalDuration before availability check |
| `src/app/(booking)/` | Remove category step; add Add-ons step; add coupon field to payment step |
| `src/app/admin/(dashboard)/services/page.tsx` | Add Add-ons tab/section |
| `src/app/admin/(dashboard)/sidebar.tsx` | Remove Categories; add Coupons |

---

## Constraints

- All queries scoped by `clientId`
- Deposit amount is always `service.depositAmount` — add-ons do not increase the deposit charged upfront
- Coupon redemption inside `$transaction` to prevent race conditions
- `validate-coupon` endpoint must be rate-limited
- Add-on name, price, and durationMinutes are snapshotted in `BookingAddOn` at booking time
- Inactive add-ons are not shown to new customers but remain on existing bookings unchanged
- Expired/disabled coupons are rejected at booking creation even if validated earlier in the session
- Category admin page removed from nav; Category model stays in DB for grouping services
