import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";

export const ticketsRouter = Router();
ticketsRouter.use(requireAdmin);

// GET /api/tickets  (admin) — all reservations. ?eventId= ?status=
ticketsRouter.get("/", async (req, res) => {
  const q = req.query as Record<string, string>;
  const where: { eventId?: number; status?: string } = {};
  if (q.eventId) where.eventId = Number(q.eventId);
  if (q.status) where.status = q.status;
  const tickets = await prisma.ticketRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: 500 });
  res.json(tickets);
});

// GET /api/tickets/summary  (admin) — totals per event (for the events list).
ticketsRouter.get("/summary", async (_req, res) => {
  const rows = await prisma.ticketRequest.groupBy({
    by: ["eventId"],
    where: { status: { not: "CANCELLED" } },
    _sum: { quantity: true },
    _count: { _all: true },
  });
  res.json(rows.map((r) => ({ eventId: r.eventId, tickets: r._sum.quantity ?? 0, requests: r._count._all })));
});

// PATCH /api/tickets/:id  (admin) — confirm / cancel / reset.
ticketsRouter.patch("/:id", async (req, res) => {
  const status = String(req.body.status ?? "").toUpperCase();
  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) return res.status(400).json({ error: "Invalid status." });
  const ticket = await prisma.ticketRequest.update({ where: { id: Number(req.params.id) }, data: { status } });
  res.json(ticket);
});
