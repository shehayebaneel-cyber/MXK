import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";

export const settingsRouter = Router();

// Defaults so the site renders before the admin customizes anything.
export const DEFAULT_SETTINGS: Record<string, string> = {
  heroVideo: "",
  heroImage: "",
  heroTitle: "MXK // MAKRAM",
  heroTagline: "Producer • Drummer • DJ",
  bio: "MXK (Makram) is a producer, drummer and DJ moving between Lebanon and Canada — blending live percussion with electronic production and a growing Arabic House sound.",
  instagram: "",
  spotify: "",
  appleMusic: "",
  soundcloud: "",
  anghami: "",
  beatport: "",
  youtube: "",
  bookingEmail: "",
};

// GET /api/settings  (public) — merged defaults + overrides.
settingsRouter.get("/", async (_req, res) => {
  const rows = await prisma.setting.findMany();
  const out: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  res.json(out);
});

// PUT /api/settings  (admin) — upsert a batch of key/values.
settingsRouter.put("/", requireAdmin, async (req, res) => {
  const body = req.body as Record<string, unknown>;
  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value: String(value ?? "") }, update: { value: String(value ?? "") } });
  }
  res.json({ ok: true });
});
