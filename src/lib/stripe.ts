import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// Convenience alias used in route handlers
export const stripe = {
  paymentIntents: {
    create: (...args: Parameters<Stripe["paymentIntents"]["create"]>) =>
      getStripe().paymentIntents.create(...args),
    retrieve: (...args: Parameters<Stripe["paymentIntents"]["retrieve"]>) =>
      getStripe().paymentIntents.retrieve(...args),
  },
};
