import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  dateTime: string;
  duration: number;
  address?: string;
  amount: string;
  manageUrl?: string;
  policies?: {
    cancellation?: string;
    late?: string;
    noShow?: string;
    deposit?: string;
  };
}

interface AdminNotificationData {
  adminEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  dateTime: string;
  bookingId: string;
}

interface ReminderEmailData {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  dateTime: string;
  duration: number;
  address?: string;
  manageUrl?: string;
}

export async function sendConfirmationEmail(data: BookingEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const from = process.env.RESEND_FROM_EMAIL || "bookings@smooveskinstudio.com";

  await getResend().emails.send({
    from,
    to: data.customerEmail,
    subject: `You're booked — ${data.serviceName}`,
    html: buildConfirmationHtml(data),
  });
}

export async function sendAdminNotificationEmail(data: AdminNotificationData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const from = process.env.RESEND_FROM_EMAIL || "bookings@smooveskinstudio.com";

  await getResend().emails.send({
    from,
    to: data.adminEmail,
    subject: `New Booking — ${data.customerName} · ${data.serviceName}`,
    html: buildAdminNotificationHtml(data),
  });
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const from = process.env.RESEND_FROM_EMAIL || "bookings@smooveskinstudio.com";

  await getResend().emails.send({
    from,
    to: data.customerEmail,
    subject: `Reminder: Your appointment tomorrow — ${data.serviceName}`,
    html: buildReminderHtml(data),
  });
}

// ─── HTML Templates ────────────────────────────────────────────────────────────

const BRAND = {
  dark: "#1a1814",
  gold: "#C9A96E",
  bg: "#faf9f7",
  border: "#e8e6e1",
  text: "#6b6860",
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.smooveskinstudio.com";

function wrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;border:1px solid ${BRAND.border};overflow:hidden;">
      <!-- Header -->
      <tr><td style="background:#faf9f7;padding:28px 28px 20px;text-align:center;border-bottom:1px solid ${BRAND.border};">
        <img src="${SITE_URL}/images/logo.svg" alt="Smoove Skin Studio" width="56" height="56" style="display:block;margin:0 auto 12px;width:56px;height:56px;">
        <p style="margin:0;font-size:18px;font-weight:400;letter-spacing:0.06em;color:${BRAND.dark};font-family:Georgia,'Times New Roman',serif;">Smoove Skin Studio</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:28px;">
        ${content}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:16px 28px;border-top:1px solid ${BRAND.border};">
        <p style="margin:0;font-size:11px;color:${BRAND.text};text-align:center;">
          Questions? Reply to this email or call us directly.<br>
          7600 Denton Hwy, Suite #139, Watauga, TX · Located inside Mattison Avenue Salon Suites &amp; Spa
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px dashed ${BRAND.border};font-size:12px;color:${BRAND.text};">${label}</td>
    <td style="padding:10px 0;border-bottom:1px dashed ${BRAND.border};font-size:13px;font-weight:600;color:${BRAND.dark};text-align:right;">${value}</td>
  </tr>`;
}

function buildConfirmationHtml(data: BookingEmailData): string {
  const firstName = data.customerName.split(" ")[0];
  const policyRows = data.policies
    ? [
        data.policies.cancellation ? `<p style="margin:0 0 8px;font-size:12px;color:${BRAND.text};"><strong style="color:${BRAND.dark};">Cancellation:</strong> ${data.policies.cancellation}</p>` : "",
        data.policies.late ? `<p style="margin:0 0 8px;font-size:12px;color:${BRAND.text};"><strong style="color:${BRAND.dark};">Late Arrival:</strong> ${data.policies.late}</p>` : "",
        data.policies.noShow ? `<p style="margin:0 0 8px;font-size:12px;color:${BRAND.text};"><strong style="color:${BRAND.dark};">No-Show:</strong> ${data.policies.noShow}</p>` : "",
        data.policies.deposit ? `<p style="margin:0;font-size:12px;color:${BRAND.text};"><strong style="color:${BRAND.dark};">Deposit:</strong> ${data.policies.deposit}</p>` : "",
      ].filter(Boolean).join("")
    : "";

  return wrapper(`
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:${BRAND.dark};">You're booked, ${firstName}!</h2>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.text};">Your appointment is confirmed. We can't wait to see you!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${detailRow("Service", data.serviceName)}
      ${detailRow("Date &amp; Time", data.dateTime)}
      ${detailRow("Duration", `${data.duration} min`)}
      ${data.address ? detailRow("Location", data.address.replace(/\n/g, "<br>")) : ""}
      ${detailRow("Amount Paid", data.amount)}
    </table>

    ${policyRows ? `
    <div style="background:${BRAND.bg};border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.text};">Studio Policies</p>
      ${policyRows}
    </div>` : ""}

    ${data.manageUrl ? `
    <div style="text-align:center;">
      <a href="${data.manageUrl}" style="display:inline-block;padding:12px 28px;background:${BRAND.dark};color:#fff;font-size:13px;font-weight:600;border-radius:10px;text-decoration:none;">
        Manage Appointment
      </a>
    </div>` : ""}
  `);
}

function buildAdminNotificationHtml(data: AdminNotificationData): string {
  return wrapper(`
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${BRAND.dark};">New Booking</h2>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.text};">A new appointment has been booked.</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${detailRow("Customer", data.customerName)}
      ${detailRow("Email", data.customerEmail)}
      ${data.customerPhone ? detailRow("Phone", data.customerPhone) : ""}
      ${detailRow("Service", data.serviceName)}
      ${detailRow("Date &amp; Time", data.dateTime)}
      ${detailRow("Booking ID", `<code style="font-size:11px;">${data.bookingId}</code>`)}
    </table>
  `);
}

function buildReminderHtml(data: ReminderEmailData): string {
  const firstName = data.customerName.split(" ")[0];

  return wrapper(`
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:${BRAND.dark};">See you tomorrow, ${firstName}!</h2>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.text};">This is a friendly reminder about your upcoming appointment.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${detailRow("Service", data.serviceName)}
      ${detailRow("Date &amp; Time", data.dateTime)}
      ${detailRow("Duration", `${data.duration} min`)}
      ${data.address ? detailRow("Location", data.address.replace(/\n/g, "<br>")) : ""}
    </table>

    ${data.manageUrl ? `
    <div style="text-align:center;">
      <a href="${data.manageUrl}" style="display:inline-block;padding:12px 28px;background:${BRAND.dark};color:#fff;font-size:13px;font-weight:600;border-radius:10px;text-decoration:none;">
        Need to Cancel or Reschedule?
      </a>
    </div>` : ""}
  `);
}
