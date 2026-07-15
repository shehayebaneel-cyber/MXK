import { Router } from "express";
import { requireAdmin } from "../auth";
import { prisma } from "../db";

export const contactRouter = Router();

const INQUIRY_TYPES = [
  "General Inquiry", "Live Performance", "DJ Booking", "Studio Production",
  "Collaboration", "Remix Request", "Press / Media", "Brand Partnership", "Other",
];

// POST /api/contact  (public) — anyone reaches MXK (booking, collab, press, general).
contactRouter.post("/", async (req, res) => {
  const b = req.body ?? {};
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim();
  if (!name || !email) return res.status(400).json({ error: "Name and email are required." });
  // Simple spam guard: honeypot field must stay empty (pretend success).
  if (String(b.website || "").trim()) return res.status(200).json({ ok: true });
  const inquiryType = INQUIRY_TYPES.includes(String(b.inquiryType)) ? String(b.inquiryType) : "General Inquiry";
  const msg = await prisma.contactMessage.create({
    data: {
      name, email, inquiryType,
      phone: String(b.phone || ""), country: String(b.country || ""),
      subject: String(b.subject || ""), message: String(b.message || ""),
    },
  });
  // TODO: email notification (Resend/SMTP) — wire when credentials are provided.
  res.status(201).json({ ok: true, id: msg.id });
});

// GET /api/contact  (admin) — inbox with filters.
//   ?box=inbox|archived   (default inbox = not archived)
//   ?read=unread|read     (optional)
//   ?type=<inquiryType>   (optional)
//   ?q=<search>           (name / email / subject / message)
contactRouter.get("/", requireAdmin, async (req, res) => {
  const q = req.query as Record<string, string>;
  const where: Record<string, unknown> = { archived: q.box === "archived" };
  if (q.read === "unread") where.read = false;
  if (q.read === "read") where.read = true;
  if (q.type && INQUIRY_TYPES.includes(q.type)) where.inquiryType = q.type;
  const term = String(q.q || "").trim();
  if (term) {
    where.OR = ["name", "email", "subject", "message"].map((field) => ({
      [field]: { contains: term, mode: "insensitive" },
    }));
  }
  const messages = await prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" } });
  const unread = await prisma.contactMessage.count({ where: { archived: false, read: false } });
  res.json({ messages, unread });
});

// PATCH /api/contact/:id  (admin) — mark read/unread, archive/unarchive.
contactRouter.patch("/:id", requireAdmin, async (req, res) => {
  const data: Record<string, boolean> = {};
  if (typeof req.body.read === "boolean") data.read = req.body.read;
  if (typeof req.body.archived === "boolean") data.archived = req.body.archived;
  if (!Object.keys(data).length) return res.status(400).json({ error: "Nothing to update." });
  const msg = await prisma.contactMessage.update({ where: { id: Number(req.params.id) }, data });
  res.json(msg);
});

// DELETE /api/contact/:id  (admin) — delete spam permanently.
contactRouter.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
