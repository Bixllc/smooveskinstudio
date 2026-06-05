import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    where: { clientId: session.clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { customerName, customerEmail, lineItems, notes, dueDate } = body;

  if (!customerName?.trim() || !customerEmail?.trim()) {
    return NextResponse.json({ error: "Customer name and email are required" }, { status: 400 });
  }
  if (!lineItems?.length) {
    return NextResponse.json({ error: "At least one line item is required" }, { status: 400 });
  }

  const subtotal = lineItems.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + item.quantity * item.unitPrice,
    0
  );

  const invoice = await prisma.invoice.create({
    data: {
      clientId: session.clientId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      lineItems,
      subtotal,
      total: subtotal,
      notes: notes?.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
