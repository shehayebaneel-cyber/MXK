import { Router, type Request, type Response } from "express";
import type Stripe from "stripe";
import { prisma } from "../db";
import { stripe } from "../lib/stripe";

// Mark the linked ticket paid + confirmed once Stripe says the session is paid.
// Idempotent — safe to call from both the return redirect and the webhook.
async function confirmFromSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return null;
  const ticketId = Number(session.metadata?.ticketId);
  if (!ticketId) return null;
  const t = await prisma.ticketRequest.findUnique({ where: { id: ticketId } });
  if (!t) return null;
  if (!t.paid) {
    await prisma.ticketRequest.update({
      where: { id: ticketId },
      data: { paid: true, status: "CONFIRMED", amountPaid: (session.amount_total ?? 0) / 100 },
    });
  }
  return t;
}

export const stripeRouter = Router();

// POST /api/stripe/confirm { sessionId }  (public) — verify + confirm on return.
stripeRouter.post("/confirm", async (req, res) => {
  if (!stripe) return res.status(400).json({ error: "Payments not configured." });
  const sessionId = String(req.body?.sessionId ?? "");
  if (!sessionId) return res.status(400).json({ error: "Missing session." });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const t = await confirmFromSession(session);
    if (!t) return res.json({ paid: false });
    res.json({ paid: true, reference: t.reference, quantity: t.quantity, title: t.eventTitle });
  } catch {
    res.status(400).json({ error: "Couldn't verify payment." });
  }
});

// Raw-body webhook — mounted in index.ts BEFORE express.json. Requires
// STRIPE_WEBHOOK_SECRET; without it, we don't trust unsigned events.
export async function stripeWebhook(req: Request, res: Response) {
  if (!stripe) return res.status(400).end();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.json({ received: true, ignored: "no webhook secret configured" });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"] as string, secret);
  } catch {
    return res.status(400).send("Invalid signature");
  }
  if (event.type === "checkout.session.completed") {
    await confirmFromSession(event.data.object as Stripe.Checkout.Session).catch(() => {});
  }
  res.json({ received: true });
}
