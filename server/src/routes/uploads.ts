import { randomBytes } from "crypto";
import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";

// Images stored IN the database so they survive redeploys (host disk is ephemeral).
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

export const uploadsRouter = Router();

// POST /api/uploads { dataUrl }  (admin)
uploadsRouter.post("/", requireAdmin, async (req, res) => {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(String(req.body.dataUrl ?? ""));
  if (!match) return res.status(400).json({ error: "Invalid image data." });
  const mime = match[1].toLowerCase();
  const ext = EXT[mime];
  if (!ext) return res.status(400).json({ error: "Use JPG, PNG, WEBP, GIF or AVIF." });
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 8 * 1024 * 1024) return res.status(413).json({ error: "Image too large (max 8 MB)." });
  const name = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${ext}`;
  await prisma.upload.create({ data: { name, mime, data: buffer } });
  res.status(201).json({ url: `/api/uploads/${name}` });
});

// GET /api/uploads/:name  (public)
uploadsRouter.get("/:name", async (req, res) => {
  const up = await prisma.upload.findUnique({ where: { name: req.params.name } });
  if (!up) return res.status(404).end();
  res.set("Content-Type", up.mime);
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.send(Buffer.from(up.data));
});
