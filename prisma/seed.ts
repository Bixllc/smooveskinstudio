import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

interface ServiceData {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description?: string;
  depositAmount?: number;
  paymentType?: "FULL" | "DEPOSIT";
}

async function upsertService(
  svc: ServiceData,
  clientId: string,
  categoryId: string
) {
  return prisma.service.upsert({
    where: { id: svc.id },
    update: {
      name: svc.name,
      durationMinutes: svc.durationMinutes,
      price: svc.price,
      description: svc.description ?? null,
      depositAmount: svc.depositAmount ?? null,
      paymentType: svc.paymentType ?? "FULL",
    },
    create: {
      id: svc.id,
      clientId,
      categoryId,
      name: svc.name,
      durationMinutes: svc.durationMinutes,
      price: svc.price,
      description: svc.description ?? null,
      depositAmount: svc.depositAmount ?? null,
      paymentType: svc.paymentType ?? "FULL",
      bufferAfterMinutes: 10,
      active: true,
    },
  });
}

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
      noShowPolicy: "No-shows will be charged the full service amount.",
      depositPolicy: "A deposit is required to secure your booking.",
    },
  });
  console.log("BusinessSettings:", settings.id);

  // 3. AvailabilityRules — Tuesday (2) through Saturday (6), 9am–6pm
  for (let day = 2; day <= 6; day++) {
    await prisma.availabilityRule.upsert({
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
  }
  console.log("AvailabilityRules: Tue-Sat 9am-6pm");

  // 4. Categories
  const bodyFace = await prisma.category.upsert({
    where: { id: "cat-body-face-waxing" },
    update: { name: "Body & Face Waxing" },
    create: {
      id: "cat-body-face-waxing",
      clientId: client.id,
      name: "Body & Face Waxing",
      displayOrder: 0,
    },
  });

  const brows = await prisma.category.upsert({
    where: { id: "cat-brow-services" },
    update: { name: "Brow Services" },
    create: {
      id: "cat-brow-services",
      clientId: client.id,
      name: "Brow Services",
      displayOrder: 1,
    },
  });
  console.log("Categories:", bodyFace.id, brows.id);

  // 5. Body & Face Waxing Services (25)
  const bodyFaceServices: ServiceData[] = [
    { id: "svc-bikini-line", name: "Bikini Line Wax", durationMinutes: 20, price: 40 },
    {
      id: "svc-full-body-smoove",
      name: "Full Body Smoove Wax",
      durationMinutes: 90,
      price: 275,
      description:
        "This includes your Brazilian + Butt strip, Full Legs, Full Arms, Underarms, and Stomach for a smooth, all-over finish.",
    },
    { id: "svc-brazilian-butt", name: "Full Brazilian Wax + Butt strip", durationMinutes: 30, price: 65 },
    { id: "svc-underarm", name: "Underarm Wax", durationMinutes: 15, price: 25 },
    { id: "svc-full-stomach", name: "Full Stomach Wax", durationMinutes: 20, price: 40 },
    { id: "svc-stomach-strip", name: "Stomach Strip (Happy Trail Wax)", durationMinutes: 10, price: 15 },
    { id: "svc-full-butt", name: "Full Butt Wax (Glutes)", durationMinutes: 20, price: 45 },
    { id: "svc-half-leg-lower", name: "Half Leg Wax (Lower /Knees Down)", durationMinutes: 35, price: 65 },
    { id: "svc-half-leg-upper", name: "Half Leg Wax (Upper/ Knees up)", durationMinutes: 45, price: 75 },
    { id: "svc-full-leg", name: "Full Leg Wax", durationMinutes: 75, price: 105 },
    { id: "svc-half-arms", name: "Half Arms Wax (Upper or Lower)", durationMinutes: 30, price: 55 },
    { id: "svc-full-arms", name: "Full Arms Wax", durationMinutes: 40, price: 70 },
    { id: "svc-full-face", name: "Full Face Wax", durationMinutes: 40, price: 55 },
    { id: "svc-ear", name: "Ear Waxing", durationMinutes: 15, price: 20 },
    { id: "svc-nose", name: "Nose Wax", durationMinutes: 15, price: 15 },
    { id: "svc-upper-lip", name: "Upper Lip Wax", durationMinutes: 15, price: 15 },
    { id: "svc-sideburns", name: "Side Burns Wax", durationMinutes: 15, price: 25 },
    { id: "svc-chin-women", name: "Chin Wax (Women)", durationMinutes: 15, price: 30 },
    {
      id: "svc-beard-women",
      name: "Beard Wax Full (Women)",
      durationMinutes: 30,
      price: 45,
      description: "Does not include upper lip",
    },
    {
      id: "svc-beard-men",
      name: "Beard Wax Full (Men)",
      durationMinutes: 45,
      price: 50,
      description: "Does not include upper lip",
    },
    { id: "svc-shoulder", name: "Shoulder Wax", durationMinutes: 30, price: 45 },
    { id: "svc-full-back", name: "Full Back Wax", durationMinutes: 50, price: 80 },
    { id: "svc-half-back", name: "Half Back Wax (Upper or Lower)", durationMinutes: 30, price: 50 },
    { id: "svc-chest-women", name: "Chest Wax (Women)", durationMinutes: 30, price: 35 },
    { id: "svc-chest-men", name: "Chest Wax (Men)", durationMinutes: 45, price: 55 },
  ];

  for (const svc of bodyFaceServices) {
    await upsertService(svc, client.id, bodyFace.id);
  }
  console.log(`Body & Face Waxing: ${bodyFaceServices.length} services`);

  // 6. Brow Services (3)
  const browServices: ServiceData[] = [
    { id: "svc-brow-wax", name: "Brow Wax (Only)", durationMinutes: 20, price: 20 },
    { id: "svc-brow-tint", name: "Brow Tint (Only)", durationMinutes: 30, price: 40 },
    { id: "svc-brow-combo", name: "Brow Wax & Tint (Combo)", durationMinutes: 50, price: 50 },
  ];

  for (const svc of browServices) {
    await upsertService(svc, client.id, brows.id);
  }
  console.log(`Brow Services: ${browServices.length} services`);

  // Clean up old seed service that no longer matches
  await prisma.service.deleteMany({
    where: {
      id: "svc-full-face-wax",
      clientId: client.id,
    },
  });

  console.log("\nSeed complete! Total services:", bodyFaceServices.length + browServices.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
