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
  if ("ticketsEnabled" in b) d.ticketsEnabled = !!b.ticketsEnabled;
  if ("ticketPrice" in b) d.ticketPrice = Math.max(0, Number(b.ticketPrice) || 0);
  if ("ticketCapacity" in b) d.ticketCapacity = Math.max(0, Math.round(Number(b.ticketCapacity) || 0));
  if ("ticketNote" in b) d.ticketNote = String(b.ticketNote ?? "");
  return d;
};

// Sum of reserved tickets (everything not cancelled) for an event.
async function ticketsSold(eventId: number): Promise<number> {
  const agg = await prisma.ticketRequest.aggregate({ _sum: { quantity: true }, where: { eventId, status: { not: "CANCELLED" } } });
  return agg._sum.quantity ?? 0;
}

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
  const sold = event.ticketsEnabled ? await ticketsSold(event.id) : 0;
  const ticketsLeft = event.ticketCapacity > 0 ? Math.max(0, event.ticketCapacity - sold) : null;
  res.json({ ...outEvent(event), ticketsSold: sold, ticketsLeft });
});

// POST /api/events/:slug/tickets  (public) — reserve tickets for a show.
eventsRouter.post("/:slug/tickets", async (req, res) => {
  const event = await prisma.event.findUnique({ where: { slug: req.params.slug } });
  if (!event || !event.isPublished) return res.status(404).json({ error: "Show not found." });
  if (!event.ticketsEnabled) return res.status(400).json({ error: "Tickets aren't available for this show." });
  if (new Date(event.date) < new Date()) return res.status(400).json({ error: "This show has already happened." });

  const b = req.body ?? {};
  if (String(b.website ?? "").trim()) return res.status(200).json({ ok: true }); // honeypot
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const quantity = Math.max(1, Math.min(10, Math.round(Number(b.quantity) || 1)));
  if (!name || !email) return res.status(400).json({ error: "Name and email are required." });

  if (event.ticketCapacity > 0) {
    const left = event.ticketCapacity - (await ticketsSold(event.id));
    if (left <= 0) return res.status(409).json({ error: "This show is sold out." });
    if (quantity > left) return res.status(409).json({ error: `Only ${left} ticket${left === 1 ? "" : "s"} left.` });
  }

  const reference = `TKT-${Math.floor(1000 + Math.random() * 9000)}-${event.id}`;
  await prisma.ticketRequest.create({
    data: { reference, eventId: event.id, eventTitle: event.title, name, email, phone: String(b.phone ?? "").trim(), quantity },
  });
  res.status(201).json({ ok: true, reference, quantity, title: event.title });
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
