import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";

export const archiveRouter = Router();

// GET /api/archive  (public) — ?category=LIVE|STUDIO|BTS  ?type=PHOTO|VIDEO
archiveRouter.get("/", async (req, res) => {
  const q = req.query as Record<string, string>;
  const items = await prisma.archiveItem.findMany({
    where: { ...(q.category ? { category: q.category } : {}), ...(q.type ? { type: q.type } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  res.json(items);
});

archiveRouter.post("/", requireAdmin, async (req, res) => {
  const b = req.body;
  if (!b.url) return res.status(400).json({ error: "A media URL is required." });
  const item = await prisma.archiveItem.create({
    data: {
      type: String(b.type || "PHOTO").toUpperCase(),
      category: String(b.category || "LIVE").toUpperCase(),
      url: String(b.url),
      thumbnail: b.thumbnail ? String(b.thumbnail) : null,
      caption: String(b.caption || ""),
      sortOrder: Number(b.sortOrder) || 0,
    },
  });
  res.status(201).json(item);
});

archiveRouter.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.archiveItem.delete({ where: { id: Number(req.params.id) } }).catch(() => {});
  res.json({ ok: true });
});
