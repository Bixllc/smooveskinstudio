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

  const addOn = await prisma.addOn.findFirst({
    where: { id, clientId: session.clientId },
    include: {
      serviceAddOns: {
        select: { serviceId: true, displayOrder: true },
      },
    },
  });

  if (!addOn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(addOn);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.addOn.findFirst({
    where: { id, clientId: session.clientId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, description, price, durationMinutes, active } = body;

  const addOn = await prisma.addOn.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(price !== undefined && { price: Number(price) }),
      ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  return NextResponse.json(addOn);
}
