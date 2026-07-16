import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";
import { slugify } from "../lib/helpers";

export const releasesRouter = Router();

const clean = (b: Record<string, unknown>) => {
  const d: Record<string, unknown> = {};
  for (const k of [
    "title",
    "type",
    "artwork",
    "featuredArtists",
    "description",
    "spotify",
    "appleMusic",
    "soundcloud",
    "youtube",
    "beatport",
    "previewUrl",
    "embedUrl",
  ]) {
    if (k in b) d[k] = b[k] == null ? null : String(b[k]);
  }
  if ("releaseDate" in b && b.releaseDate) d.releaseDate = new Date(String(b.releaseDate));
  for (const k of ["isPublished", "isFeatured"]) if (k in b) d[k] = !!b[k];
  if ("sortOrder" in b) d.sortOrder = Number(b.sortOrder) || 0;
  return d;
};

// GET /api/releases  (public) — published releases, newest first. ?type= filters.
releasesRouter.get("/", async (req, res) => {
  const type = String((req.query as Record<string, string>).type || "");
  const all = (req.query as Record<string, string>).all === "1";
  const releases = await prisma.release.findMany({
    where: { ...(all ? {} : { isPublished: true }), ...(type ? { type } : {}) },
    orderBy: [{ releaseDate: "desc" }, { sortOrder: "asc" }],
  });
  res.json(releases);
});

// GET /api/releases/featured — the homepage "latest release" (featured, else newest).
releasesRouter.get("/featured", async (_req, res) => {
  const featured =
    (await prisma.release.findFirst({ where: { isPublished: true, isFeatured: true }, orderBy: { releaseDate: "desc" } })) ??
    (await prisma.release.findFirst({ where: { isPublished: true }, orderBy: { releaseDate: "desc" } }));
  res.json(featured);
});

// GET /api/releases/:slug  (public)
releasesRouter.get("/:slug", async (req, res) => {
  const release = await prisma.release.findUnique({ where: { slug: req.params.slug } });
  if (!release) return res.status(404).json({ error: "Release not found." });
  res.json(release);
});

// POST /api/releases  (admin)
releasesRouter.post("/", requireAdmin, async (req, res) => {
  const b = req.body;
  if (!b.title) return res.status(400).json({ error: "Title is required." });
  let slug = slugify(String(b.slug || b.title));
  while (await prisma.release.findUnique({ where: { slug } })) slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
  const data = clean(b);
  const release = await prisma.release.create({
    data: { slug, title: String(b.title), releaseDate: b.releaseDate ? new Date(String(b.releaseDate)) : new Date(), ...data } as never,
  });
  res.status(201).json(release);
});

// PATCH /api/releases/:id  (admin)
releasesRouter.patch("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const data = clean(req.body);
  if (req.body.slug) data.slug = slugify(String(req.body.slug));
  const release = await prisma.release.update({ where: { id }, data });
  res.json(release);
});

// DELETE /api/releases/:id  (admin)
releasesRouter.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.release.delete({ where: { id: Number(req.params.id) } }).catch(() => {});
  res.json({ ok: true });
});
