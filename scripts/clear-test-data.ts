/**
 * Clears all transactional data while preserving configuration.
 *
 * KEEPS: Client, BusinessSettings, AvailabilityRule, Category, Service,
 *        AddOn, ServiceAddOn, FormTemplate, ServiceFormAssignment, Coupon
 *
 * DELETES: FormSubmission, BookingAddOn, Payment, Booking, Customer, Invoice
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  console.log("Clearing test data...");

  const formSubmissions = await prisma.formSubmission.deleteMany({});
  const bookingAddOns = await prisma.bookingAddOn.deleteMany({});
  const payments = await prisma.payment.deleteMany({});
  const bookings = await prisma.booking.deleteMany({});
  const customers = await prisma.customer.deleteMany({});
  const invoices = await prisma.invoice.deleteMany({});

  console.log(`Deleted:`);
  console.log(`  ${formSubmissions.count} form submissions`);
  console.log(`  ${bookingAddOns.count} booking add-ons`);
  console.log(`  ${payments.count} payments`);
  console.log(`  ${bookings.count} bookings`);
  console.log(`  ${customers.count} customers`);
  console.log(`  ${invoices.count} invoices`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
