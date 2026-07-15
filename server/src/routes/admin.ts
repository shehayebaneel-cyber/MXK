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
  const [releases, events, messages, unreadMessages, archive] = await Promise.all([
    prisma.release.count(),
    prisma.event.count(),
    prisma.contactMessage.count({ where: { archived: false } }),
    prisma.contactMessage.count({ where: { archived: false, read: false } }),
    prisma.archiveItem.count(),
  ]);
  res.json({ releases, events, messages, unreadMessages, archive });
});
