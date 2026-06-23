import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { firstName, lastName, email, phone, message } = await request.json();

  if (
    typeof firstName !== "string" || !firstName.trim() ||
    typeof lastName !== "string" || !lastName.trim() ||
    typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof message !== "string" || !message.trim()
  ) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    await sendContactFormEmail({
      firstName,
      lastName,
      email,
      phone: typeof phone === "string" ? phone : undefined,
      message,
    });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
