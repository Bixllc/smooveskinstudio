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

  client           Client             @relation(fields: [clientId], references: [id])
  serviceAddOns    ServiceAddOn[]
  bookingAddOns    BookingAddOn[]

  @@index([clientId])
}

model ServiceAddOn {
  id           String @id @default(uuid())
  serviceId    String
  addOnId      String
  displayOrder Int    @default(0)

  service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  addOn   AddOn   @relation(fields: [addOnId], references: [id], onDelete: Cascade)

  @@unique([serviceId, addOnId])
  @@index([serviceId])
}

model BookingAddOn {
  id        String  @id @default(uuid())
  bookingId String
  addOnId   String
  name      String  // snapshot
  price     Decimal @db.Decimal(10, 2) // snapshot

  booking Booking @relation(fields: [bookingId], references: [id])
  addOn   AddOn   @relation(fields: [addOnId], references: [id])

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

### Booking table additions

```prisma
// New fields on existing Booking model
couponId          String?
discountAmount    Decimal? @db.Decimal(10, 2)
addOnsTotalAmount Decimal? @db.Decimal(10, 2)
totalAmount       Decimal? @db.Decimal(10, 2)

coupon     Coupon?       @relation(fields: [couponId], references: [id])
addOns     BookingAddOn[]
```

---

## Pricing Logic

```ts
const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0)
const subtotal    = service.price + addOnsTotal
const discount    = coupon ? subtotal * (coupon.discountPercent / 100) : 0
const total       = subtotal - discount
```

This total is passed to Square for payment. All amounts are snapshotted on the booking record so future edits to prices/coupons don't affect historical data.

---

## Booking Flow Changes

Current flow:
1. Category → 2. Service → 3. Date/Time → 4. Customer Info → 5. Payment

Updated flow:
1. Category → 2. Service → **3. Add-ons (skipped if none assigned)** → 4. Date/Time → 5. Customer Info → 6. Payment

### Step 3 — Add-ons
- Shows add-ons assigned to the selected service
- Client selects 0 or more
- Running total updates live (service price + selected add-ons)
- If no add-ons are assigned to the service, this step is skipped entirely

### Step 6 — Payment
- Shows itemized breakdown: service, each add-on, subtotal
- "Have a promo code?" input field
- On code entry: validates via `POST /api/booking/validate-coupon`
  - Checks: exists for clientId, active, not expired, usageCount < usageLimit
  - Returns: discountPercent, discountAmount, newTotal
- Shows updated total with discount line if valid
- On booking confirmation: couponId saved, usageCount incremented atomically

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
- Table: code, name, discount %, uses (usageCount / usageLimit), expires, status
- Create / Edit / Disable actions (no delete — preserve history)

**Create/Edit form:**
- Code (required, unique per client, auto-uppercased)
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
| PATCH | `/api/admin/add-ons/[id]` | Update add-on |
| GET | `/api/admin/add-ons/[id]/services` | Get service assignments |
| POST | `/api/admin/add-ons/[id]/services` | Update service assignments |
| GET | `/api/admin/coupons` | List coupons for client |
| POST | `/api/admin/coupons` | Create coupon |
| PATCH | `/api/admin/coupons/[id]` | Update/disable coupon |
| POST | `/api/booking/validate-coupon` | Validate code at checkout (public) |

---

## Sidebar Navigation

Add to `navItems` in `sidebar.tsx`:
- Add-ons (icon: `IconPuzzle` or `IconPlus`)
- Coupons (icon: `IconTag`)

---

## Constraints

- All queries scoped by `clientId`
- `usageCount` increment must be atomic (Prisma `increment` operator) to prevent race conditions
- Coupon validation is public but returns minimal info (no internal IDs until booking is confirmed)
- Add-on duration is additive: `endTimeUtc = startTimeUtc + service.durationMinutes + sum(addOn.durationMinutes) + buffers`
- BookingAddOn snapshots name + price at booking time; edits to AddOn do not affect past bookings
