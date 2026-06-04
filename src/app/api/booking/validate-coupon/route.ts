import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, code, subtotal } = body;

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }
    if (subtotal === undefined || isNaN(Number(subtotal))) {
      return NextResponse.json({ error: "subtotal is required" }, { status: 400 });
    }

    const upperCode = String(code).trim().toUpperCase();

    const coupon = await prisma.coupon.findFirst({
      where: { clientId, code: upperCode, active: true },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid promo code" });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This promo code has expired" });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "This promo code has reached its usage limit" });
    }

    const sub = Number(subtotal);
    const discountAmount = parseFloat((sub * (Number(coupon.discountPercent) / 100)).toFixed(2));
    const newTotal = parseFloat((sub - discountAmount).toFixed(2));

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      discountPercent: Number(coupon.discountPercent),
      discountAmount,
      newTotal,
    });
  } catch (error) {
    console.error("validate-coupon error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
