import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    where: { clientId: session.clientId },
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    name,
    description,
    categoryId,
    durationMinutes,
    price,
    depositAmount,
    paymentType,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    active,
  } = body;

  if (!name || !categoryId || !durationMinutes || price === undefined) {
    return NextResponse.json(
      { error: "name, categoryId, durationMinutes, and price are required" },
      { status: 400 }
    );
  }

  // Verify category belongs to this client
  const category = await prisma.category.findFirst({
    where: { id: categoryId, clientId: session.clientId },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      clientId: session.clientId,
      categoryId,
      name,
      description: description || null,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      depositAmount: depositAmount ? Number(depositAmount) : null,
      paymentType: paymentType === "DEPOSIT" ? "DEPOSIT" : "FULL",
      bufferBeforeMinutes: Number(bufferBeforeMinutes) || 0,
      bufferAfterMinutes: Number(bufferAfterMinutes) || 0,
      active: active !== false,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
