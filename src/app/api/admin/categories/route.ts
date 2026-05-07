import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { clientId: session.clientId },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Get the next display order
  const maxOrder = await prisma.category.findFirst({
    where: { clientId: session.clientId },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });

  const category = await prisma.category.create({
    data: {
      clientId: session.clientId,
      name,
      description: description || null,
      displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
