import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const category = await prisma.category.findFirst({
    where: { id, clientId: session.clientId },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.active !== undefined) data.active = body.active;
  if (body.displayOrder !== undefined) data.displayOrder = body.displayOrder;

  const updated = await prisma.category.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const category = await prisma.category.findFirst({
    where: { id, clientId: session.clientId },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  // Check if services exist in this category
  const serviceCount = await prisma.service.count({
    where: { categoryId: id, clientId: session.clientId },
  });

  if (serviceCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${serviceCount} service(s) are assigned to this category. Remove or reassign them first.`,
      },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
