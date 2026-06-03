-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."FormType" AS ENUM ('INTAKE', 'CONSENT', 'WAIVER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('FULL', 'DEPOSIT');

-- CreateTable
CREATE TABLE "public"."AvailabilityRule" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlockedTime" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startTimeUtc" TIMESTAMP(3) NOT NULL,
    "endTimeUtc" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "BlockedTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "startTimeUtc" TIMESTAMP(3) NOT NULL,
    "endTimeUtc" TIMESTAMP(3) NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentProvider" TEXT,
    "paymentId" TEXT,
    "confirmationEmailSentAt" TIMESTAMP(3),
    "reminderEmailSentAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "manageToken" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessSettings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "cancellationPolicy" TEXT,
    "latePolicy" TEXT,
    "noShowPolicy" TEXT,
    "depositPolicy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alertCancellation" BOOLEAN NOT NULL DEFAULT true,
    "alertNewBooking" BOOLEAN NOT NULL DEFAULT true,
    "alertReschedule" BOOLEAN NOT NULL DEFAULT true,
    "allowClientCancel" BOOLEAN NOT NULL DEFAULT true,
    "allowClientReschedule" BOOLEAN NOT NULL DEFAULT true,
    "cancelRescheduleWindowHours" INTEGER NOT NULL DEFAULT 24,
    "emailTemplateSettings" JSONB,
    "maxBookingDaysOut" INTEGER NOT NULL DEFAULT 100,
    "minBookingLeadHours" INTEGER NOT NULL DEFAULT 2,
    "summaryEmailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "summaryEmailFrequency" TEXT NOT NULL DEFAULT 'daily',
    "summaryEmailTime" TEXT NOT NULL DEFAULT '17:00',

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "adminNotes" TEXT,
    "isVip" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormSubmission" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormTemplate" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."FormType" NOT NULL DEFAULT 'INTAKE',
    "fields" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2),
    "paymentType" "public"."PaymentType" NOT NULL DEFAULT 'FULL',
    "bufferBeforeMinutes" INTEGER NOT NULL DEFAULT 0,
    "bufferAfterMinutes" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceFormAssignment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceFormAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvailabilityRule_clientId_dayOfWeek_idx" ON "public"."AvailabilityRule"("clientId" ASC, "dayOfWeek" ASC);

-- CreateIndex
CREATE INDEX "AvailabilityRule_clientId_idx" ON "public"."AvailabilityRule"("clientId" ASC);

-- CreateIndex
CREATE INDEX "BlockedTime_clientId_idx" ON "public"."BlockedTime"("clientId" ASC);

-- CreateIndex
CREATE INDEX "BlockedTime_startTimeUtc_endTimeUtc_idx" ON "public"."BlockedTime"("startTimeUtc" ASC, "endTimeUtc" ASC);

-- CreateIndex
CREATE INDEX "Booking_clientId_idx" ON "public"."Booking"("clientId" ASC);

-- CreateIndex
CREATE INDEX "Booking_clientId_status_idx" ON "public"."Booking"("clientId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_manageToken_key" ON "public"."Booking"("manageToken" ASC);

-- CreateIndex
CREATE INDEX "Booking_startTimeUtc_endTimeUtc_idx" ON "public"."Booking"("startTimeUtc" ASC, "endTimeUtc" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSettings_clientId_key" ON "public"."BusinessSettings"("clientId" ASC);

-- CreateIndex
CREATE INDEX "Category_clientId_idx" ON "public"."Category"("clientId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "public"."Client"("slug" ASC);

-- CreateIndex
CREATE INDEX "Customer_clientId_email_idx" ON "public"."Customer"("clientId" ASC, "email" ASC);

-- CreateIndex
CREATE INDEX "Customer_clientId_idx" ON "public"."Customer"("clientId" ASC);

-- CreateIndex
CREATE INDEX "FormSubmission_bookingId_idx" ON "public"."FormSubmission"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "FormSubmission_clientId_idx" ON "public"."FormSubmission"("clientId" ASC);

-- CreateIndex
CREATE INDEX "FormSubmission_formTemplateId_idx" ON "public"."FormSubmission"("formTemplateId" ASC);

-- CreateIndex
CREATE INDEX "FormTemplate_clientId_idx" ON "public"."FormTemplate"("clientId" ASC);

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "public"."Payment"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "Payment_clientId_idx" ON "public"."Payment"("clientId" ASC);

-- CreateIndex
CREATE INDEX "Service_categoryId_idx" ON "public"."Service"("categoryId" ASC);

-- CreateIndex
CREATE INDEX "Service_clientId_idx" ON "public"."Service"("clientId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceFormAssignment_serviceId_formTemplateId_key" ON "public"."ServiceFormAssignment"("serviceId" ASC, "formTemplateId" ASC);

-- CreateIndex
CREATE INDEX "ServiceFormAssignment_serviceId_idx" ON "public"."ServiceFormAssignment"("serviceId" ASC);

-- AddForeignKey
ALTER TABLE "public"."AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlockedTime" ADD CONSTRAINT "BlockedTime_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessSettings" ADD CONSTRAINT "BusinessSettings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormSubmission" ADD CONSTRAINT "FormSubmission_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormSubmission" ADD CONSTRAINT "FormSubmission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormSubmission" ADD CONSTRAINT "FormSubmission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormSubmission" ADD CONSTRAINT "FormSubmission_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "public"."FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormTemplate" ADD CONSTRAINT "FormTemplate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceFormAssignment" ADD CONSTRAINT "ServiceFormAssignment_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "public"."FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceFormAssignment" ADD CONSTRAINT "ServiceFormAssignment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

