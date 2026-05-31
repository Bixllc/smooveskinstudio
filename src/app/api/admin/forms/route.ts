import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const forms = await prisma.formTemplate.findMany({
    where: { clientId: session.clientId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { serviceAssignments: true, submissions: true } },
    },
  });

  return NextResponse.json(forms);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, type, fields } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const validTypes = ["INTAKE", "CONSENT", "WAIVER", "CUSTOM"];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
  }

  const form = await prisma.formTemplate.create({
    data: {
      clientId: session.clientId,
      name: name.trim(),
      description: description?.trim() || null,
      type: type || "INTAKE",
      fields: Array.isArray(fields) ? fields : [],
    },
  });

  return NextResponse.json(form, { status: 201 });
}
