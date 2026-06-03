import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addOns = await prisma.addOn.findMany({
    where: { clientId: session.clientId },
    include: {
      serviceAddOns: {
        select: { serviceId: true, service: { select: { name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(addOns);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, price, durationMinutes, active } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 });
  }

  const addOn = await prisma.addOn.create({
    data: {
      clientId: session.clientId,
      name: name.trim(),
      description: description?.trim() || null,
      price: Number(price),
      durationMinutes: Number(durationMinutes) || 0,
      active: active !== false,
    },
  });

  return NextResponse.json(addOn, { status: 201 });
}
