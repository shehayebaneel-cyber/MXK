import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";
import { outEvent, slugify, toJsonArr } from "../lib/helpers";

export const eventsRouter = Router();

const clean = (b: Record<string, unknown>) => {
  const d: Record<string, unknown> = {};
  for (const k of ["title", "venue", "city", "description", "ticketUrl", "poster", "tracklist"]) if (k in b) d[k] = b[k] == null ? null : String(b[k]);
  if ("date" in b && b.date) d.date = new Date(String(b.date));
  if ("photos" in b) d.photos = toJsonArr(b.photos);
  if ("videos" in b) d.videos = toJsonArr(b.videos);
  if ("isPublished" in b) d.isPublished = !!b.isPublished;
  return d;
};

// GET /api/events  (public) — split into upcoming/past by date.
eventsRouter.get("/", async (req, res) => {
  const all = (req.query as Record<string, string>).all === "1";
  const events = await prisma.event.findMany({ where: all ? {} : { isPublished: true }, orderBy: { date: "desc" } });
  const now = new Date();
  const mapped = events.map(outEvent);
  res.json({
    upcoming: mapped.filter((e) => new Date(e.date) >= now).sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    past: mapped.filter((e) => new Date(e.date) < now),
  });
});

eventsRouter.get("/:slug", async (req, res) => {
  const event = await prisma.event.findUnique({ where: { slug: req.params.slug } });
  if (!event) return res.status(404).json({ error: "Event not found." });
  res.json(outEvent(event));
});

eventsRouter.post("/", requireAdmin, async (req, res) => {
  const b = req.body;
  if (!b.title) return res.status(400).json({ error: "Title is required." });
  let slug = slugify(String(b.slug || b.title));
  while (await prisma.event.findUnique({ where: { slug } })) slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
  const event = await prisma.event.create({ data: { slug, title: String(b.title), date: b.date ? new Date(String(b.date)) : new Date(), ...clean(b) } as never });
  res.status(201).json(outEvent(event));
});

eventsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const data = clean(req.body);
  if (req.body.slug) data.slug = slugify(String(req.body.slug));
  const event = await prisma.event.update({ where: { id: Number(req.params.id) }, data });
  res.json(outEvent(event));
});

eventsRouter.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.event.delete({ where: { id: Number(req.params.id) } }).catch(() => {});
  res.json({ ok: true });
});
