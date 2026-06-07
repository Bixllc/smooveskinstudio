-- AlterTable
ALTER TABLE "BusinessSettings" ADD COLUMN "reminderLeadHours" INTEGER NOT NULL DEFAULT 24;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "reminderSmsSentAt" TIMESTAMP(3);
