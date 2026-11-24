# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Climax — Environment & Civic Intelligence**: a web platform that predicts, reports, and
analyzes natural hazards on a real-time continuum, scores the regions most likely to be
impacted, and delivers precautions plus an AI assistant.

The app is a **no-build static web app** — browser-native ES modules, no package manager, no
bundler, no test suite. Third-party libs (Leaflet, `@supabase/supabase-js`) load from CDNs.
At the repo **root**, `index.html` is the **marketing landing page** (ember-themed, vanilla
HTML/CSS/JS — `assets/landing.css` + `assets/landing.js`), and `app.html` is the **functional
dashboard** (live map, auth, AI assistant). The landing page's CTAs link into `app.html`; both
share the warm "ember" palette and Google Sans. An earlier Snake game still lives, untouched,
at `Climax/index.html`. A snapshot of a compiled React build of this concept is vendored,
untouched, under `design/` (see `design/README.md`); it was the source the landing page's design
and copy were ported from.

## Running

ES modules require HTTP (not `file://`). From the repo root:

```bash
python -m http.server 8000      # landing: http://localhost:8000/  ·  dashboard: /app.html
```

Edits take effect on reload. There is nothing to compile.

## Configuration

Nothing is hard-coded with secrets. Config is read by `assets/config.js` as **file defaults
merged with per-browser `localStorage` overrides** set via the in-app Settings panel:
- **Supabase** `SUPABASE_URL` + `SUPABASE_ANON_KEY` (anon key is safe client-side; data is
  protected by RLS). Run `supabase/schema.sql` once in the project's SQL Editor to create the
  `watched_locations` table and its policies.
- **Anthropic** API key (stored only in the browser) + model (`ANTHROPIC_MODEL`, default
  `claude-opus-5-5`).

Until Supabase is configured, the app runs in **Preview mode** (guest): everything works
except accounts, and watched regions persist to `localStorage` instead of the database.

## Architecture

The controller is `assets/app.js`; it owns a single `state` object and wires everything.
Cross-cutting things worth knowing before editing:

- **Auth gate vs. Preview mode** — `onAuthResolved()` decides what shows. The auth gate
  (`#auth-view`) appears only when Supabase *is* configured and nobody is signed in. With no
  Supabase config, the dashboard always shows in guest mode. `loadRegions()` branches on
  `state.user`: signed-in → Supabase `watched_locations`; guest → `localStorage`. Any new
  persisted data must handle both branches.
- **Real-time continuum** — `refreshData()` pulls all feeds, re-renders, and recomputes
  region risk; `startRefreshLoop()` re-runs it every `REFRESH_INTERVAL_MS`. Keep new data
  derivations inside `refreshData`/`recomputeAssessments` so they stay live.
- **Data layer (`hazards.js`)** — each feed fetcher normalizes to a common event shape
  (`{id,source,type,title,severity 1-5,lat,lon,time,...}`); `fetchAllHazards()` runs them
  under `Promise.allSettled` so one feed failing never breaks the rest (it reports per-source
  status instead). `assessRegion()` is the "prediction" core: nearby-event severity decayed
  by distance (haversine) + Open-Meteo weather forecast → a 0–100 score and risk level.
  Feeds are free, keyless, CORS-enabled (USGS, NASA EONET, NWS, Open-Meteo) — all verified
  working from the browser.
- **AI assistant (`agent.js`)** — streams from the Anthropic Messages API **directly in the
  browser** (requires the `anthropic-dangerous-direct-browser-access: true` header + the
  user's `x-api-key`). `buildSystemPrompt()` injects the current hazard snapshot + watched-
  region assessments so answers are grounded in live data. SSE is parsed by hand (split on
  `\n\n`, read `content_block_delta` → `text_delta`). For production, move this behind a
  backend so the key isn't client-side.
- **Module split** — `config.js` (settings/keys), `supabaseClient.js` (auth + CRUD),
  `hazards.js` (data + risk), `map.js` (Leaflet; globals from CDN `<script>`), `agent.js`
  (Claude), `ui.js` (DOM/format helpers: `el`, `escapeHtml`, `toast`, `renderRichText`),
  `app.js` (controller). `app.html` has all dashboard markup; `assets/styles.css` all its styling
  (ember dark theme via `:root` custom properties; layout is CSS grid, responsive at 1000px/560px).
  The separate landing page (`index.html`) is self-contained with `assets/landing.css` +
  `assets/landing.js` and shares the same `:root` ember tokens.

When changing Anthropic API code, consult the `claude-api` skill for current model IDs; when
changing anything Supabase (schema, RLS, auth), consult the `supabase` skill — RLS policies in
`schema.sql` must stay per-user (`(select auth.uid()) = user_id`, with `WITH CHECK` on UPDATE).

## Workflow

Keep every change saved and revertable on GitHub: commit each logical change locally with a
clear, descriptive message, then push. The repo is the private GitHub repo **Climax** (owner
`roaixen`, remote `origin` = `https://github.com/roaixen/Climax`). Git root is
`C:\Users\91847\Claude-Climax`. `gh` CLI is installed; the user authenticates with
`! gh auth login`.

Note: Claude Code's auto-mode permission classifier blocks `git push` and `gh repo create`
(flagged as an outward upload), so Claude makes the commit but the **user runs the push** via
`! git push` — unless a Bash permission rule for `git push`/`gh` is added.
