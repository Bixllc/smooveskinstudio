# SMS Reminders — Design Spec

**Goal:** Send SMS reminders to clients before their appointments using Twilio, alongside existing email reminders. Admin can configure how far in advance reminders go out.

**Architecture:** Vercel cron endpoint fires every 15 minutes, queries confirmed bookings within the configured lead window, sends email + SMS reminders independently. Reminder lead time is a per-client setting.

**Tech Stack:** Twilio (SMS), Vercel Cron, Prisma, Next.js API routes

---

## Schema Changes

### `BusinessSettings`
Add:
```prisma
reminderLeadHours Int @default(24)
```

### `Booking`
Add:
```prisma
reminderSmsSentAt DateTime?
```

---

## New Files

### `src/lib/sms.ts`
Twilio wrapper. Single exported function:
```ts
sendSmsReminder(data: {
  to: string;           // customer phone
  customerName: string;
  serviceName: string;
  dateTime: string;     // formatted local time string
  businessPhone?: string;
}): Promise<void>
```
- Guards on missing `TWILIO_*` env vars (no-op if not configured)
- Message: "Hi [FirstName], just a reminder that your [Service] appointment is tomorrow at [Time]. Questions? Call us at [businessPhone]. Reply STOP to opt out."
- Uses `twilio` npm package

### `src/app/api/cron/reminders/route.ts`
GET endpoint secured with `Authorization: Bearer $CRON_SECRET`.

Logic per client:
1. Fetch all clients with their `businessSettings` (timezone, reminderLeadHours, phone, manageUrl base)
2. For each client, find bookings where:
   - `status = CONFIRMED`
   - `startTimeUtc` between `now + (reminderLeadHours - 1)h` and `now + (reminderLeadHours + 1)h`
   - `reminderEmailSentAt IS NULL`
3. For each booking, fetch customer + service
4. Send email reminder → set `reminderEmailSentAt`
5. If customer has phone → send SMS → set `reminderSmsSentAt`
6. Email and SMS failures are caught independently — one failing doesn't block the other

### `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## Modified Files

### `src/app/api/admin/settings/route.ts`
Add `"reminderLeadHours"` to the `allowedFields` list.

### `src/app/admin/(dashboard)/settings/scheduling/page.tsx`
Add `reminderLeadHours` field to the form — number input, min 1, max 168 (1 week), label "Reminder lead time (hours)", hint "How many hours before the appointment to send the reminder".

---

## Environment Variables Required
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=   # E.164 format, e.g. +14155552671
CRON_SECRET=           # Set in Vercel dashboard, auto-available to cron routes
```

---

## What Does NOT Change
- Email reminder template (`sendReminderEmail` in `email.ts`) — unchanged
- Booking flow — unchanged
- Customer phone collection — already exists
- `reminderEmailSentAt` tracking — unchanged, SMS tracked separately
