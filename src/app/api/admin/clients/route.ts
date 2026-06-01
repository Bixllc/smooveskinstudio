import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      clientId: session.clientId,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      bookings: {
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        include: {
          service: { select: { price: true, name: true } },
        },
        orderBy: { startTimeUtc: "desc" },
      },
    },
    orderBy: [{ isVip: "desc" }, { fullName: "asc" }],
  });

  const result = customers.map((c) => {
    // Compute favourite service
    const counts: Record<string, number> = {};
    for (const b of c.bookings) {
      counts[b.service.name] = (counts[b.service.name] ?? 0) + 1;
    }
    const favService =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      isVip: c.isVip,
      totalVisits: c.bookings.length,
      totalSpend: c.bookings.reduce(
        (s, b) => s + Number(b.service.price),
        0
      ),
      lastVisit: c.bookings[0]?.startTimeUtc ?? null,
      favService,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.fullName || !body.email) {
    return NextResponse.json(
      { error: "fullName and email are required" },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.create({
    data: {
      clientId: session.clientId,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone ?? null,
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
