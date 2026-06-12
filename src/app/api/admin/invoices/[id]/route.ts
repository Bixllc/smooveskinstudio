import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";

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

  if (body.status === "SENT") {
    const settings = await prisma.businessSettings.findUnique({
      where: { clientId: session.clientId },
      select: { businessName: true },
    });

    const lineItems = Array.isArray(invoice.lineItems)
      ? (invoice.lineItems as { description: string; quantity: number; unitPrice: number }[])
      : [];

    await sendInvoiceEmail({
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      invoiceId: invoice.id,
      lineItems,
      subtotal: Number(invoice.subtotal),
      total: Number(invoice.total),
      dueDate: invoice.dueDate
        ? invoice.dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null,
      notes: invoice.notes,
      businessName: settings?.businessName,
    }).catch(console.error);
  }

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
