# Phase 1: Add-ons + Coupons — Design Spec

**Date:** 2026-06-02  
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
  name            String  // snapshot — preserve historical name
  price           Decimal @db.Decimal(10, 2) // snapshot
  durationMinutes Int     @default(0)         // snapshot — needed for rescheduling

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

The existing `Client` model must have these relations added:

```prisma
addOns       AddOn[]
serviceAddOns ServiceAddOn[]
bookingAddOns BookingAddOn[]
coupons      Coupon[]
```

### Booking table additions

```prisma
// New fields on existing Booking model
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

```ts
const addOnsTotal  = selectedAddOns.reduce((sum, a) => sum + a.price, 0)
const subtotal     = service.price + addOnsTotal
const discount     = coupon ? subtotal * (coupon.discountPercent / 100) : 0
const total        = subtotal - discount
const depositRatio = service.depositAmount / service.price  // proportional deposit
const chargeNow    = service.depositAmount + addOnsTotal * depositRatio - discount

// Charge Square: chargeNow (deposit + proportional add-on share, minus discount)
// Remaining balance = total - chargeNow (collected after appointment)
```

All amounts are snapshotted on the `Booking` record (`addOnsTotalAmount`, `discountAmount`, `totalAmount`) at creation time. The Square charge route (`/api/payments/square/route.ts`) must be updated to use `booking.totalAmount` (or `chargeNow` for deposit) rather than `booking.service.price` directly.

---

## Duration & Availability

Add-ons may extend the appointment duration. This affects two places:

### 1. Slot availability API (`/api/bookings/slots`)

The slot-fetching request must include `addOnIds[]`. The API computes:

```ts
const addOnDuration = selectedAddOns.reduce((sum, a) => sum + a.durationMinutes, 0)
const totalDuration = service.durationMinutes + addOnDuration
```

`isSlotAvailable` receives `totalDuration` (not just `service.durationMinutes`) so that slots too short to fit the service + add-ons are not offered.

### 2. Booking creation (`/api/bookings`)

The request body includes `selectedAddOnIds[]`. On creation:

```ts
const addOnDuration = selectedAddOns.reduce((sum, a) => sum + a.durationMinutes, 0)
endTimeUtc = addMinutes(startTimeUtc, service.durationMinutes + addOnDuration + service.bufferBeforeMinutes + service.bufferAfterMinutes)
```

---

## Booking Flow

Current: Category → Service → Date/Time → Customer Info → Payment

Updated: Category → Service → **Add-ons** → Date/Time → Customer Info → Payment

Add-ons are placed before Date/Time so the slot API can receive the full duration.

### Step 3 — Add-ons
- Shows add-ons assigned to the selected service
- Client selects 0 or more; running total and duration update live
- If no add-ons are assigned to the service, this step is skipped entirely
- Selected add-on IDs are carried into step 4

### Step 4 — Date/Time
- Slot API called with `serviceId` + `addOnIds[]`
- Available slots reflect total duration (service + add-ons)

### Step 6 — Payment
- Itemized breakdown: service price, each add-on, subtotal
- "Have a promo code?" input
- On code entry: `POST /api/booking/validate-coupon` validates the code
  - Checks: exists for clientId, active, not expired, usageCount < usageLimit
  - Returns: discountPercent, discountAmount, newTotal (no internal IDs)
- Coupon is re-validated at booking creation — not just at display time

---

## Coupon Redemption — Race Condition Guard

The validate-coupon endpoint only checks eligibility. The actual redemption (incrementing `usageCount`) must happen inside the booking creation transaction:

```ts
await prisma.$transaction(async (tx) => {
  // Re-check coupon inside transaction
  const coupon = await tx.coupon.findFirst({
    where: { id: couponId, active: true, clientId },
  })
  if (!coupon) throw new Error('Coupon no longer valid')
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached')
  }

  // Create booking
  const booking = await tx.booking.create({ ... })

  // Increment atomically
  await tx.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  })

  return booking
})
```

This ensures no two concurrent bookings can both pass the limit check and both increment past it.

---

## Security

### validate-coupon endpoint
- Public (unauthenticated) but returns minimal data (no internal IDs, no listing)
- Must have rate limiting applied (e.g., Vercel Edge middleware or `@upstash/ratelimit`) to prevent brute-force enumeration of codes
- Scoped to `clientId` from the booking session — cannot probe other clients' codes

---

## Admin UI

### Add-ons page (`/admin/add-ons`)

**List view:**
- Table: name, price, duration added, status (active/inactive)
- Create / Edit / Toggle active actions

**Create/Edit form:**
- Name (required)
- Description (optional)
- Price (required)
- Duration added in minutes (optional, default 0)
- Active toggle

**Service assignment:**
- Per add-on: multi-select which services it applies to
- Same pattern as `ServiceFormAssignment` already in the codebase

### Coupons page (`/admin/coupons`)

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

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/add-ons` | List add-ons for client |
| POST | `/api/admin/add-ons` | Create add-on |
| GET | `/api/admin/add-ons/[id]` | Fetch single add-on (edit form) |
| PATCH | `/api/admin/add-ons/[id]` | Update add-on |
| GET | `/api/admin/add-ons/[id]/services` | Get service assignments |
| POST | `/api/admin/add-ons/[id]/services` | Update service assignments |
| GET | `/api/admin/coupons` | List coupons for client |
| POST | `/api/admin/coupons` | Create coupon |
| GET | `/api/admin/coupons/[id]` | Fetch single coupon (edit form) |
| PATCH | `/api/admin/coupons/[id]` | Update/disable coupon |
| POST | `/api/booking/validate-coupon` | Validate code at checkout (public, rate-limited) |

---

## Sidebar Navigation

Add to `navItems` in `sidebar.tsx`:
- Add-ons (icon: `IconPuzzle2` or `IconPlus`)
- Coupons (icon: `IconTag`)

---

## Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add AddOn, ServiceAddOn, BookingAddOn, Coupon models; add back-relations to Client and Service; add fields to Booking |
| `src/app/api/payments/square/route.ts` | Use `booking.totalAmount` (or deposit chargeNow) instead of `booking.service.price` |
| `src/app/api/bookings/route.ts` | Accept `selectedAddOnIds[]`, compute extended endTimeUtc, snapshot add-on data |
| `src/lib/availability.ts` | Accept totalDuration parameter, use it instead of service.durationMinutes |
| `src/app/api/bookings/slots/route.ts` | Accept `addOnIds[]`, compute totalDuration before calling availability check |
| `src/app/(booking)/[...steps]/` | Add Add-ons step, add coupon field to payment step |
| `src/app/admin/(dashboard)/sidebar.tsx` | Add Add-ons and Coupons nav items |

---

## Constraints

- All queries scoped by `clientId`
- Coupon redemption inside `$transaction` to prevent race conditions
- `validate-coupon` endpoint must be rate-limited
- Add-on name, price, and durationMinutes are snapshotted in `BookingAddOn` at booking time
- Inactive add-ons are not shown to new customers but remain on existing bookings unchanged
- Expired/disabled coupons are rejected at booking creation even if validated earlier in the session
