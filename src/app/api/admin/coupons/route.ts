import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    where: { clientId: session.clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(coupons);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { code, name, discountPercent, usageLimit, expiresAt, active } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (
    discountPercent === undefined ||
    isNaN(Number(discountPercent)) ||
    Number(discountPercent) <= 0 ||
    Number(discountPercent) > 100
  ) {
    return NextResponse.json({ error: "discountPercent must be between 1 and 100" }, { status: 400 });
  }

  const upperCode = String(code).trim().toUpperCase();

  const existing = await prisma.coupon.findFirst({
    where: { clientId: session.clientId, code: upperCode },
  });
  if (existing) {
    return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      clientId: session.clientId,
      code: upperCode,
      name: name.trim(),
      discountPercent: Number(discountPercent),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: active !== false,
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
