import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  dateTime: string; // formatted in local timezone
  duration: number;
  address?: string;
  amount: string;
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

export async function sendConfirmationEmail(
  data: BookingEmailData
): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL || "bookings@example.com";

  await resend.emails.send({
    from,
    to: data.customerEmail,
    subject: `Booking Confirmed — ${data.serviceName}`,
    html: buildConfirmationHtml(data),
  });
}

export async function sendAdminNotificationEmail(
  data: AdminNotificationData
): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL || "bookings@example.com";

  await resend.emails.send({
    from,
    to: data.adminEmail,
    subject: `New Booking — ${data.customerName} for ${data.serviceName}`,
    html: buildAdminNotificationHtml(data),
  });
}

function buildConfirmationHtml(data: BookingEmailData): string {
  const policySection = data.policies
    ? `
    <hr />
    <h3>Policies</h3>
    ${data.policies.cancellation ? `<p><strong>Cancellation:</strong> ${data.policies.cancellation}</p>` : ""}
    ${data.policies.late ? `<p><strong>Late Arrival:</strong> ${data.policies.late}</p>` : ""}
    ${data.policies.noShow ? `<p><strong>No-Show:</strong> ${data.policies.noShow}</p>` : ""}
    ${data.policies.deposit ? `<p><strong>Deposit:</strong> ${data.policies.deposit}</p>` : ""}
  `
    : "";

  return `
    <h2>Your booking is confirmed!</h2>
    <p>Hi ${data.customerName},</p>
    <p>Your appointment has been confirmed.</p>
    <table>
      <tr><td><strong>Service:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Date & Time:</strong></td><td>${data.dateTime}</td></tr>
      <tr><td><strong>Duration:</strong></td><td>${data.duration} minutes</td></tr>
      ${data.address ? `<tr><td><strong>Location:</strong></td><td>${data.address}</td></tr>` : ""}
      <tr><td><strong>Total:</strong></td><td>${data.amount}</td></tr>
    </table>
    ${policySection}
  `;
}

function buildAdminNotificationHtml(data: AdminNotificationData): string {
  return `
    <h2>New Booking Received</h2>
    <table>
      <tr><td><strong>Customer:</strong></td><td>${data.customerName}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${data.customerEmail}</td></tr>
      ${data.customerPhone ? `<tr><td><strong>Phone:</strong></td><td>${data.customerPhone}</td></tr>` : ""}
      <tr><td><strong>Service:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Date & Time:</strong></td><td>${data.dateTime}</td></tr>
      <tr><td><strong>Booking ID:</strong></td><td>${data.bookingId}</td></tr>
    </table>
  `;
}
