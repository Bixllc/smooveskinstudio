import crypto from "crypto";

interface CreateCheckoutParams {
  bookingId: string;
  serviceName: string;
  amount: number; // in cents
  currency?: string;
  customerEmail: string;
}

interface CheckoutResult {
  checkoutUrl: string;
  paymentId: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const { bookingId, serviceName, amount, currency = "USD", customerEmail } =
    params;

  const idempotencyKey = crypto.randomUUID();
  const baseUrl =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  const response = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      "Square-Version": "2024-11-20",
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: idempotencyKey,
      payment_link: {
        order: {
          location_id: process.env.SQUARE_LOCATION_ID,
          line_items: [
            {
              name: serviceName,
              quantity: "1",
              base_price_money: {
                amount,
                currency,
              },
            },
          ],
          reference_id: bookingId,
        },
        checkout_options: {
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation/${bookingId}`,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Square checkout creation failed: ${response.status} ${JSON.stringify(error)}`
    );
  }

  const data = await response.json();

  return {
    checkoutUrl: data.payment_link.url,
    paymentId: data.payment_link.order_id,
  };
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookUrl: string
): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey) return false;

  const combined = webhookUrl + body;
  const expectedSignature = crypto
    .createHmac("sha256", signatureKey)
    .update(combined)
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
