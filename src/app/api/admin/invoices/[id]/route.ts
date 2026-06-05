import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.clientId !== session.clientId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: any = {};
  if (body.status) {
    data.status = body.status;
    if (body.status === "SENT") data.sentAt = new Date();
    if (body.status === "PAID") data.paidAt = new Date();
  }

  const updated = await prisma.invoice.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.clientId !== session.clientId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
