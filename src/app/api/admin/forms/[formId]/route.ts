import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

async function getOwnedForm(formId: string, clientId: string) {
  return prisma.formTemplate.findFirst({
    where: { id: formId, clientId },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { formId } = await params;
  const form = await prisma.formTemplate.findFirst({
    where: { id: formId, clientId: session.clientId },
    include: {
      serviceAssignments: {
        include: { service: { select: { id: true, name: true } } },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  return NextResponse.json(form);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { formId } = await params;
  const form = await getOwnedForm(formId, session.clientId);
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  if (body.type !== undefined) data.type = body.type;
  if (body.fields !== undefined) data.fields = Array.isArray(body.fields) ? body.fields : [];
  if (body.active !== undefined) data.active = Boolean(body.active);

  const updated = await prisma.formTemplate.update({
    where: { id: formId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { formId } = await params;
  const form = await getOwnedForm(formId, session.clientId);
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const submissionCount = await prisma.formSubmission.count({
    where: { formTemplateId: formId },
  });

  if (submissionCount > 0) {
    // Soft delete — deactivate to preserve submission history
    await prisma.formTemplate.update({
      where: { id: formId },
      data: { active: false },
    });
    return NextResponse.json({ success: true, deactivated: true });
  }

  await prisma.formTemplate.delete({ where: { id: formId } });
  return NextResponse.json({ success: true });
}
