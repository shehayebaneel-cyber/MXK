import Stripe from "stripe";

// Stripe stays dormant until STRIPE_SECRET_KEY is set. When absent, the ticket
// flow falls back to reserve/RSVP (pay at the door).
const key = process.env.STRIPE_SECRET_KEY;
export const stripe = key ? new Stripe(key) : null;
export const stripeEnabled = !!stripe;

/** Base URL for Stripe success/cancel redirects — the site making the request. */
export const siteBase = (origin?: string) => origin || process.env.FRONTEND_URL || "";
