# MXK — Official Artist Platform

The digital home of **MXK // MAKRAM** — producer, drummer & DJ. A dark, cinematic
music site: latest releases, live shows, Arabic House, archive, EPK and booking.

## Stack
- **web/** — React + Vite + TypeScript + Tailwind v4 (dark, mobile-first, scroll animations, persistent floating player).
- **server/** — Express + Prisma + PostgreSQL (Neon). REST API for releases, events, archive, bookings, settings, image uploads.

## Local development
```bash
# 1. Backend
cd server
cp .env.example .env      # fill DATABASE_URL (Neon) + admin creds
npm install
npm run push              # push Prisma schema to the DB
npm run seed              # optional: sample releases + events
npm run dev               # API on http://localhost:4300

# 2. Frontend (separate terminal)
cd web
npm install
npm run dev               # site on http://localhost:5400 (proxies /api → :4300)
```

## Deployment (recommended)
- **API** → Render (or Railway/Fly): build `npm run build`, start `npm start`. Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- **Web** → Cloudflare Pages / Vercel / Netlify: build `npm run build`, output `dist`. Set `VITE_API_URL` to the deployed API origin.

## What's built
- Cinematic homepage (hero + video support, latest-release with pre-release countdown/pre-save that flips to streaming links on release).
- Music (filters: singles/albums/remixes/collabs/Arabic House) + per-release SEO pages `/music/<slug>`.
- Live (upcoming/past) + per-event pages `/live/<slug>` with gallery + video.
- Arabic House, Archive (filterable, fullscreen/modal viewer), About (timeline), EPK, Booking form (with spam honeypot).
- Persistent floating music player that keeps playing across pages.

## Roadmap
- Admin dashboard (manage music, live, archive, bookings, homepage/settings, image uploads).
- Booking email notifications (Resend/SMTP).
- Behind The Sound section; merch, tickets, newsletter, fan accounts, Arabic language (architecture is ready).
