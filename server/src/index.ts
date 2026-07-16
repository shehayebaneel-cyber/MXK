import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { prisma } from "./db";
import { adminRouter } from "./routes/admin";
import { archiveRouter } from "./routes/archive";
import { contactRouter } from "./routes/contact";
import { eventsRouter } from "./routes/events";
import { releasesRouter } from "./routes/releases";
import { settingsRouter } from "./routes/settings";
import { stripeRouter, stripeWebhook } from "./routes/stripe";
import { ticketsRouter } from "./routes/tickets";
import { uploadsRouter } from "./routes/uploads";

// Neon (serverless) can drop/suspend connections; a single failed query must
// never take the whole API down. Log and keep running.
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e));

const app = express();
app.use(cors());
// Stripe webhook needs the RAW body for signature verification — mount before JSON.
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);
// Uploads arrive as base64 data URLs (audio previews up to 10 MB → ~14 MB encoded).
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/admin", adminRouter);
app.use("/api/releases", releasesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/archive", archiveRouter);
app.use("/api/contact", contactRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/uploads", uploadsRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found." }));
// Express 4 doesn't forward async rejections here, but sync throws + the guards
// above keep the process alive; return a clean 500 when reached.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("route error:", err);
  if (!res.headersSent) res.status(500).json({ error: "Server error — please retry." });
});

// Wake the Neon connection on boot (serverless cold start) with a few retries.
async function warmup(tries = 6) {
  for (let i = 1; i <= tries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("DB connected.");
      return;
    } catch {
      console.error(`DB warmup ${i}/${tries} failed — retrying…`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  console.error("DB still unreachable after warmup — the API will keep retrying per request.");
}

const port = Number(process.env.PORT) || 4300;
app.listen(port, () => {
  console.log(`MXK API on :${port}`);
  warmup();
});
