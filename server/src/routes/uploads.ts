import { randomBytes } from "crypto";
import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";

// Media stored IN the database so it survives redeploys (host disk is ephemeral).
const IMAGE_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
// Short audio previews (30–60s clips / short tracks) for the player.
const AUDIO_EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};
const IMAGE_MAX = 8 * 1024 * 1024;
const AUDIO_MAX = 10 * 1024 * 1024;

export const uploadsRouter = Router();

// POST /api/uploads { dataUrl }  (admin) — images or short audio previews.
uploadsRouter.post("/", requireAdmin, async (req, res) => {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(String(req.body.dataUrl ?? ""));
  if (!match) return res.status(400).json({ error: "Invalid file data." });
  const mime = match[1].toLowerCase();
  const isAudio = mime in AUDIO_EXT;
  const ext = IMAGE_EXT[mime] ?? AUDIO_EXT[mime];
  if (!ext) return res.status(400).json({ error: "Use an image (JPG/PNG/WEBP/GIF/AVIF) or audio (MP3/M4A/AAC/OGG/WAV)." });
  const buffer = Buffer.from(match[2], "base64");
  const max = isAudio ? AUDIO_MAX : IMAGE_MAX;
  if (buffer.length > max) return res.status(413).json({ error: `${isAudio ? "Audio" : "Image"} too large (max ${max / 1024 / 1024} MB).` });
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
