import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const coupon = await prisma.coupon.findFirst({
    where: { id, clientId: session.clientId },
  });

  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(coupon);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.coupon.findFirst({
    where: { id, clientId: session.clientId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, discountPercent, usageLimit, expiresAt, active } = body;

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(discountPercent !== undefined && { discountPercent: Number(discountPercent) }),
      ...(usageLimit !== undefined && { usageLimit: usageLimit ? Number(usageLimit) : null }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  return NextResponse.json(coupon);
}
