# MXK — CLAUDE.md

## What this is
Official artist site for MXK (Makram) — Lebanese-Canadian producer, drummer and
DJ in Toronto; Arab Melodic House. Dark cinematic music platform: releases with
audio previews, live sets, EPK for bookers, contact. Audience: fans + event
bookers (like ECLIPSE, who book him).

## Stack & layout
- web/ (Vite + React + Tailwind v4) — port 5400
- server/ (Express + Prisma) — port 4300
- Deploy: Render blueprint (render.yaml) — mxk-api + mxk-web
  (live at mxk-web.onrender.com), auto-deploys on push to main
- GitHub: shehayebaneel-cyber/MXK

## Commands
- Dev: `cd server && npm run dev` + `cd web && npm run dev`
- Typecheck: `npx tsc --noEmit` in web/ and server/
- Format: `npm run format` (repo root) · Lint: `npm run lint`

## Brand
- Voice: dark, cinematic, chrome-on-black — "MXK // MAKRAM"
- Tokens in web/src/index.css @theme: ink blacks, chrome #f4f4f6, fog muted,
  blue #4f7cff / purple #9a5cff accents. Display font: Anton.
- Atmosphere: aurora blobs + film grain + cursor glow + tilt/3D cards.
- Favicon/logo: geometric M-X-K strokes, blue X (web/public/favicon.svg).

## Domain rules
- EnterExperience: first-visit full-screen splash that starts the featured
  track; persistent FloatingPlayer keeps audio across routes. Don't break the
  once-per-browser localStorage gating.
- The featured release may be a pre-release with NO previewUrl — playback code
  must fall back to the newest release that has one.
- EPK page must print clean (print CSS flips dark→light, hides nav/player).
- Admin uploads audio previews (mp3/m4a) directly, stored via the API.

## Current status / next up
- Full public site + API live; admin dashboard exists for releases/settings
- Next candidates: shows/tour dates management, mixes page, press photos pack
