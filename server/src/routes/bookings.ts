import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";

export const bookingsRouter = Router();

// POST /api/bookings  (public) — a promoter/booker submits a request.
bookingsRouter.post("/", async (req, res) => {
  const b = req.body;
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim();
  if (!name || !email) return res.status(400).json({ error: "Name and email are required." });
  // Simple spam guard: honeypot field must stay empty.
  if (String(b.website || "").trim()) return res.status(200).json({ ok: true });
  const booking = await prisma.booking.create({
    data: {
      name, email,
      company: String(b.company || ""), country: String(b.country || ""), venue: String(b.venue || ""),
      eventDate: String(b.eventDate || ""), bookingType: String(b.bookingType || ""),
      budget: String(b.budget || ""), message: String(b.message || ""),
    },
  });
  // TODO: email notification (Resend/SMTP) — wire when credentials are provided.
  res.status(201).json({ ok: true, id: booking.id });
});

// GET /api/bookings  (admin) — ?status=NEW|CONTACTED|ARCHIVED
bookingsRouter.get("/", requireAdmin, async (req, res) => {
  const status = String((req.query as Record<string, string>).status || "");
  const bookings = await prisma.booking.findMany({ where: status ? { status } : {}, orderBy: { createdAt: "desc" } });
  res.json(bookings);
});

bookingsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const status = String(req.body.status || "").toUpperCase();
  if (!["NEW", "CONTACTED", "ARCHIVED"].includes(status)) return res.status(400).json({ error: "Invalid status." });
  const booking = await prisma.booking.update({ where: { id: Number(req.params.id) }, data: { status } });
  res.json(booking);
});
