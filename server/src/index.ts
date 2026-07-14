import cors from "cors";
import express from "express";
import { adminRouter } from "./routes/admin";
import { archiveRouter } from "./routes/archive";
import { bookingsRouter } from "./routes/bookings";
import { eventsRouter } from "./routes/events";
import { releasesRouter } from "./routes/releases";
import { settingsRouter } from "./routes/settings";
import { uploadsRouter } from "./routes/uploads";

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" })); // room for base64 image uploads

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/admin", adminRouter);
app.use("/api/releases", releasesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/archive", archiveRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/uploads", uploadsRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found." }));

const port = Number(process.env.PORT) || 4300;
app.listen(port, () => console.log(`MXK API on :${port}`));
