# CLAUDE.md — Custom Booking Platform

## Product Goal

Build a reusable, custom booking platform for service-based businesses.

The system allows customers to:

* Browse categories and services
* Select a time
* Pay using Square
* Receive confirmation and reminders

Admins can:

* Manage services and categories
* Manage bookings
* Update business info and policies

This is a productized service, not a public SaaS platform.

---

## Core Philosophy

* One reusable system across all clients
* Controlled customization only
* Keep logic centralized
* Avoid over-engineering
* Optimize for speed and maintainability

---

## Multi-Client Architecture

Use a shared database with `clientId` on all client-owned tables.

Each client has:

* Unique `clientId`
* Separate data
* Own domain or subdomain
* Own Square account
* Own BusinessSettings

All queries must be scoped by `clientId`.

Never access or mutate data without filtering by `clientId`.

---

## Auth

Use Supabase Auth.

### Admin

* Email/password login
* Each admin belongs to a `clientId`
* Admin routes protected
* Admin only accesses their own data

### Customers

* No accounts
* Guest checkout only

### Route Protection

* Protect `/admin/*` routes via middleware
* Redirect unauthenticated users to login
* Prevent cross-client access

---

## Booking Flow

### Step 1 — Category Selection

* Display categories
* User selects a category

### Step 2 — Service Selection

* Display services filtered by category
* Show name, duration, price, description
* User selects a service

### Step 3 — Date & Time

* Show calendar
* Show available time slots
* Respect:

  * availability rules
  * bookings
  * buffers
  * blocked times

### Step 4 — Customer Info

* fullName
* email
* phone
* notes (optional)

### Step 5 — Payment (Square)

* Deposit or full payment
* Booking is confirmed only after payment success
* Use Square webhooks

### Step 6 — Confirmation

* Show booking details
* Send confirmation email
* Send admin notification

---

## Timezone Handling

* Store all times in UTC
* Store client timezone in `BusinessSettings.timezone`
* Use `date-fns-tz` (preferred)

Rules:

* Convert client-selected times → UTC before saving
* Convert UTC → client timezone for display
* All availability calculations use client timezone
* Emails must show local time

---

## Payment Integration

Use Square.

* Use Square API for checkout
* Use webhooks for confirmation
* Store Square payment IDs
* Do not store card data

Fees are handled by the client.

---

## Email System

Use Resend for transactional emails.

### Emails Sent to Customer

1. Confirmation Email

   * Sent immediately after booking is confirmed
   * Includes:

     * service
     * date/time
     * address
     * payment summary
     * policies

2. Reminder Email

   * Sent 24 hours before appointment
   * Includes:

     * service
     * date/time
     * address
     * policies

3. Cancellation Email

4. Reschedule Email

### Emails Sent to Admin

* New booking
* Cancellation
* Reschedule

---

## Reminder Scheduling

Use a background job.

### Behavior

* Run every 15 minutes

* Find bookings:

  * status = confirmed
  * startTimeUtc between now +23h and +24h
  * reminderEmailSentAt is null

* Send reminder

* Set `reminderEmailSentAt`

---

## Data Models

### Client

```ts
Client {
  id
  name
  slug
  domain
  active
  createdAt
}
```

### BusinessSettings

```ts
BusinessSettings {
  id
  clientId
  businessName
  address
  phone
  email
  timezone

  cancellationPolicy
  latePolicy
  noShowPolicy
  depositPolicy

  updatedAt
}
```

### Category

```ts
Category {
  id
  clientId
  name
  description
  displayOrder
  active
}
```

### Service

```ts
Service {
  id
  clientId
  categoryId
  name
  description
  durationMinutes
  price
  depositAmount
  paymentType
  bufferBeforeMinutes
  bufferAfterMinutes
  active
}
```

### Customer

```ts
Customer {
  id
  clientId
  fullName
  email
  phone
  notes
}
```

### Booking

```ts
Booking {
  id
  clientId
  serviceId
  customerId
  startTimeUtc
  endTimeUtc

  status
  paymentStatus

  paymentProvider
  paymentId

  confirmationEmailSentAt
  reminderEmailSentAt

  notes
  createdAt
  updatedAt
}
```

### Payment

```ts
Payment {
  id
  clientId
  bookingId
  provider
  providerPaymentId
  amount
  status
  paidAt
}
```

### AvailabilityRule

```ts
AvailabilityRule {
  id
  clientId
  dayOfWeek
  startTime
  endTime
  active
}
```

### BlockedTime

```ts
BlockedTime {
  id
  clientId
  startTimeUtc
  endTimeUtc
  reason
}
```

---

## Business Settings (Editable)

Clients can update:

* businessName
* address
* phone
* email
* timezone
* cancellationPolicy
* latePolicy
* noShowPolicy
* depositPolicy

Policies are text-only.

---

## Client Restrictions

Clients cannot modify:

* booking logic
* payment logic
* availability engine
* UI layout
* system workflows

---

## Availability Rules

A slot is valid if:

* within availability hours
* no overlap with bookings
* no overlap with blocked times
* includes buffer time

### Overlap Rule

```ts
existing.startTimeUtc < requested.endTimeUtc &&
existing.endTimeUtc > requested.startTimeUtc
```

---

## Buffer Logic

```ts
totalTime = duration + bufferBefore + bufferAfter
```

---

## Booking Status

```ts
pending_payment
confirmed
cancelled
rescheduled
completed
no_show
```

---

## Payment Status

```ts
unpaid
pending
paid
failed
refunded
```

---

## Admin Dashboard

### Categories

* create/edit/delete
* reorder

### Services

* create/edit/delete
* assign category
* set price/duration/buffer

### Bookings

* view/filter
* cancel
* reschedule
* mark complete/no-show

### Settings

* update business info
* update policies

---

## MVP Scope

Build only:

1. Category selection
2. Service selection
3. Availability system
4. Booking form
5. Square payments
6. Confirmation flow
7. Email notifications
8. Admin auth
9. Admin dashboard
10. Business settings

---

## Do Not Build

* memberships
* subscriptions
* coupons
* staff support
* multi-location
* SMS
* customer accounts

---

## Engineering Principles

* Scope all queries by clientId
* Prevent double booking at DB level
* Use transactions for booking creation
* Verify webhooks
* Keep logic out of UI
* Keep system simple and reusable

---

## Final Goal

A fast, clean, branded booking system that:

* increases bookings
* reduces no-shows
* is easy for clients to manage
* is easy for developers to maintain
