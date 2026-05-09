import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // 1. Client
  const client = await prisma.client.upsert({
    where: { slug: "smooveskinstudio" },
    update: {},
    create: {
      name: "Smoove Skin Studio",
      slug: "smooveskinstudio",
      domain: "localhost:3000",
      active: true,
    },
  });
  console.log("Client:", client.id);

  // 2. BusinessSettings
  const settings = await prisma.businessSettings.upsert({
    where: { clientId: client.id },
    update: {},
    create: {
      clientId: client.id,
      businessName: "Smoove Skin Studio",
      address: "Fort Lauderdale, FL",
      phone: "",
      email: "admin@smooveskinstudio.com",
      timezone: "America/New_York",
      cancellationPolicy:
        "Cancellations must be made 24 hours in advance.",
      latePolicy:
        "Arriving more than 15 minutes late may result in a shortened or cancelled appointment.",
      noShowPolicy:
        "No-shows will be charged the full service amount.",
      depositPolicy:
        "A deposit is required to secure your booking.",
    },
  });
  console.log("BusinessSettings:", settings.id);

  // 3. AvailabilityRules — Tuesday (2) through Saturday (6), 9am–6pm
  for (let day = 2; day <= 6; day++) {
    const rule = await prisma.availabilityRule.upsert({
      where: { id: `avail-day-${day}` },
      update: {},
      create: {
        id: `avail-day-${day}`,
        clientId: client.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        active: true,
      },
    });
    console.log(`AvailabilityRule day ${day}:`, rule.id);
  }

  // 4. Category
  const category = await prisma.category.upsert({
    where: { id: "cat-body-face-waxing" },
    update: {},
    create: {
      id: "cat-body-face-waxing",
      clientId: client.id,
      name: "Body & Face Waxing",
      displayOrder: 0,
    },
  });
  console.log("Category:", category.id);

  // 5. Service
  const service = await prisma.service.upsert({
    where: { id: "svc-full-face-wax" },
    update: {},
    create: {
      id: "svc-full-face-wax",
      clientId: client.id,
      categoryId: category.id,
      name: "Full Face Wax",
      durationMinutes: 30,
      price: 65.0,
      depositAmount: 20.0,
      paymentType: "DEPOSIT",
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 10,
      active: true,
    },
  });
  console.log("Service:", service.id);

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
