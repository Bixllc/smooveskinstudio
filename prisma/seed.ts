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

  // Vajacial & Hydrojelly Masks category
  const vajacial = await prisma.category.upsert({
    where: { id: "cat-vajacial" },
    update: { name: "Vajacial & Hydrojelly Masks" },
    create: {
      id: "cat-vajacial",
      clientId: client.id,
      name: "Vajacial & Hydrojelly Masks",
      displayOrder: 2,
    },
  });

  const vajacialServices: ServiceData[] = [
    { id: "svc-vajacial", name: "Vajacial", durationMinutes: 45, price: 75 },
    { id: "svc-hydrojelly", name: "Hydrojelly Mask", durationMinutes: 30, price: 55 },
    { id: "svc-vajacial-hydrojelly", name: "Vajacial + Hydrojelly Combo", durationMinutes: 60, price: 115 },
  ];
  for (const svc of vajacialServices) {
    await upsertService(svc, client.id, vajacial.id);
  }
  console.log(`Vajacial & Hydrojelly: ${vajacialServices.length} services`);

  // Mock customers
  const mockCustomers = [
    { id: "cust-001", fullName: "Khloe Langston", email: "khloe@example.com", phone: "214-555-0101", isVip: true },
    { id: "cust-002", fullName: "Nakeisha Sealey", email: "nakeisha@example.com", phone: "817-555-0102", isVip: true },
    { id: "cust-003", fullName: "Tammy Rhodes", email: "tammy@example.com", phone: "214-555-0103", isVip: false },
    { id: "cust-004", fullName: "Lyndsey Barnes", email: "lyndsey@example.com", phone: "972-555-0104", isVip: false },
    { id: "cust-005", fullName: "Sarah Mitchell", email: "sarah@example.com", phone: "817-555-0105", isVip: false },
    { id: "cust-006", fullName: "Mikala Johnson", email: "mikala@example.com", phone: "214-555-0106", isVip: false },
    { id: "cust-007", fullName: "Ebony Pierce", email: "ebony@example.com", phone: "972-555-0107", isVip: false },
    { id: "cust-008", fullName: "Phylicia Davis", email: "phylicia@example.com", phone: "817-555-0108", isVip: false },
    { id: "cust-009", fullName: "Lashonda Turner", email: "lashonda@example.com", phone: "214-555-0109", isVip: false },
    { id: "cust-010", fullName: "Briana Wells", email: "briana@example.com", phone: "972-555-0110", isVip: false },
  ];

  for (const c of mockCustomers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: { isVip: c.isVip },
      create: { clientId: client.id, ...c },
    });
  }
  console.log(`Mock customers: ${mockCustomers.length}`);

  // Mock bookings
  const now = new Date();
  function daysAgo(d: number, hour: number) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    dt.setHours(hour, 0, 0, 0);
    return dt;
  }
  function daysAhead(d: number, hour: number) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    dt.setHours(hour, 0, 0, 0);
    return dt;
  }

  const mockBookings = [
    { id: "bk-001", customerId: "cust-001", serviceId: "svc-brazilian-butt", start: daysAgo(14, 10), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-002", customerId: "cust-002", serviceId: "svc-full-leg", start: daysAgo(13, 11), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-003", customerId: "cust-003", serviceId: "svc-brow-combo", start: daysAgo(12, 14), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-004", customerId: "cust-004", serviceId: "svc-vajacial", start: daysAgo(10, 9), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-005", customerId: "cust-005", serviceId: "svc-underarm", start: daysAgo(9, 15), status: "NO_SHOW", paymentStatus: "UNPAID" },
    { id: "bk-006", customerId: "cust-001", serviceId: "svc-brazilian-butt", start: daysAgo(7, 10), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-007", customerId: "cust-006", serviceId: "svc-hydrojelly", start: daysAgo(7, 13), status: "CANCELLED", paymentStatus: "REFUNDED" },
    { id: "bk-008", customerId: "cust-007", serviceId: "svc-brow-wax", start: daysAgo(5, 11), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-009", customerId: "cust-008", serviceId: "svc-half-leg-lower", start: daysAgo(4, 14), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-010", customerId: "cust-002", serviceId: "svc-brazilian-butt", start: daysAgo(3, 10), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-011", customerId: "cust-009", serviceId: "svc-full-face", start: daysAgo(2, 15), status: "CANCELLED", paymentStatus: "UNPAID" },
    { id: "bk-012", customerId: "cust-003", serviceId: "svc-brow-tint", start: daysAgo(1, 11), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-013", customerId: "cust-001", serviceId: "svc-brazilian-butt", start: daysAhead(1, 10), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-014", customerId: "cust-004", serviceId: "svc-vajacial-hydrojelly", start: daysAhead(1, 13), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-015", customerId: "cust-005", serviceId: "svc-full-leg", start: daysAhead(2, 11), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-016", customerId: "cust-010", serviceId: "svc-brow-combo", start: daysAhead(3, 14), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-017", customerId: "cust-006", serviceId: "svc-hydrojelly", start: daysAhead(4, 9), status: "CONFIRMED", paymentStatus: "PAID" },
    { id: "bk-018", customerId: "cust-002", serviceId: "svc-underarm", start: daysAhead(5, 15), status: "CONFIRMED", paymentStatus: "PAID" },
  ];

  for (const bk of mockBookings) {
    const svc = await prisma.service.findUnique({ where: { id: bk.serviceId } });
    if (!svc) { console.warn(`Service not found: ${bk.serviceId}`); continue; }
    const end = new Date(bk.start.getTime() + svc.durationMinutes * 60000);
    await prisma.booking.upsert({
      where: { id: bk.id },
      update: {},
      create: {
        id: bk.id,
        clientId: client.id,
        serviceId: bk.serviceId,
        customerId: bk.customerId,
        startTimeUtc: bk.start,
        endTimeUtc: end,
        status: bk.status as any,
        paymentStatus: bk.paymentStatus as any,
      },
    });
  }
  console.log(`Mock bookings: ${mockBookings.length}`);

  console.log("\nSeed complete! Total services:", bodyFaceServices.length + browServices.length + vajacialServices.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
