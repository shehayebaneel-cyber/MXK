import { Router } from "express";
import { requireAdmin, signToken, verifyLogin } from "../auth";
import { prisma } from "../db";

export const adminRouter = Router();

// POST /api/admin/login  { email, password }
adminRouter.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!verifyLogin(String(email || ""), String(password || ""))) {
    return res.status(401).json({ error: "Wrong email or password." });
  }
  res.json({ token: signToken({ role: "admin", email }), name: process.env.ADMIN_NAME || "MXK" });
});

// GET /api/admin/overview  (admin) — dashboard counts.
adminRouter.get("/overview", requireAdmin, async (_req, res) => {
  const [releases, events, bookings, newBookings, archive] = await Promise.all([
    prisma.release.count(),
    prisma.event.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "NEW" } }),
    prisma.archiveItem.count(),
  ]);
  res.json({ releases, events, bookings, newBookings, archive });
});
