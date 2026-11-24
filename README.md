# Climax — Environment & Civic Intelligence

Climax is a platform that **predicts, reports, and analyzes natural hazards on a real-time continuum**, ranks the regions most likely to be impacted, and delivers precautions and safety measures — with an integrated AI assistant.

This repository contains the web application (MVP). It is a **no-build** static web app (HTML/CSS/ES modules) that runs anywhere you can serve static files.

The deployed marketing site — a bundled Vite/React single-page app — is vendored as-is under [`design/`](design/); see [The deployed site](#the-deployed-site-design) below.

## What it does

- **Live hazard map** — plots global hazards in real time from free, keyless public feeds:
  - **USGS** — earthquakes (past 7 days)
  - **NASA EONET** — open natural events (wildfires, storms, volcanoes, floods…)
  - **NWS** — active US weather alerts
- **Community road reports** — signed-in users can pin potholes, road damage, flooding,
  landslides, wildfires, closures, and other road hazards. Reports are publicly visible and
  unverified; Preview-mode reports stay in the current browser.
- **Active threats** — a severity-ranked, filterable list of current events.
- **My Regions** — add any city/region (geocoded via Open-Meteo); Climax scores its
  risk (0–100) by combining nearby hazards with the Open-Meteo weather forecast.
- **Alerts** — surfaces regions whose risk is elevated or that have a severe nearby hazard.
- **AI assistant** — a Claude-powered chat, grounded on the live hazard snapshot, that
  explains risks and gives concrete precautions.
- **Accounts** — Google and GitHub sign-in via Supabase; watched regions are saved per
  account (and protected by Row Level Security). Email/password sign-up and login are
  currently not offered in the app.

Before you configure Supabase, the app runs in **Preview mode**: everything works except
account sign-in, and watched regions are saved locally in your browser.

## Run it locally

ES modules must be served over HTTP (not opened as a `file://` path). From the repo root:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/>.

## Configure (in-app Settings, or edit `assets/config.js`)

1. **Supabase** (real accounts + saved regions)
   - Create a free project at <https://supabase.com>.
   - In **Project Settings → API**, copy the **Project URL** and the **anon/publishable** key.
   - In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) to create the
     `watched_locations` and `road_reports` tables with RLS.
   - Paste the URL + anon key into Climax **Settings** (gear in the top bar).
   - In **Authentication → Providers**, enable Email, Google, and GitHub. Add the OAuth
     client credentials from Google Cloud and GitHub, and set each provider's callback URL
     to the Supabase callback URL shown in its provider settings.
   - In **Authentication → URL Configuration**, add the app URL (for local development,
     `http://localhost:8000/app.html`) to the redirect URL allow list. Add your deployed
     app URL there as well. Email confirmation and OAuth will return to the current app URL.
   - If social sign-in displays `Unsupported provider: provider is not enabled`, the
     provider has not been enabled in Supabase or its OAuth credentials are missing. This is
     a Supabase project setting; enabling Google/GitHub requires OAuth client credentials
     from their respective developer consoles.
2. **Anthropic** (AI assistant)
   - Paste your Anthropic API key into **Settings**. It is stored only in your browser and
     sent directly to `api.anthropic.com`. **Do not commit a real key or ship it in a public build.**
   - Default model: `claude-opus-5-5` (change in Settings — e.g. `claude-sonnet-5-5` or
     `claude-haiku-5-5` to reduce cost).

## Architecture

No framework, no bundler. Browser-native ES modules under `assets/`:

| Module | Responsibility |
|---|---|
| `config.js` | Settings (file defaults merged with per-browser `localStorage` overrides) + API key storage |
| `supabaseClient.js` | Supabase init + auth + `watched_locations` CRUD |
| `hazards.js` | Fetch & normalize the live feeds; severity model; haversine; per-region risk scoring; geocoding |
| `map.js` | Leaflet map rendering (hazard markers + watched-region pins) |
| `agent.js` | Streaming Anthropic Messages API client; builds the live-data system prompt |
| `ui.js` | DOM/formatting helpers (element builder, escaping, toasts, time-ago, rich text) |
| `app.js` | Controller: auth gate, real-time refresh loop, dashboard, regions, alerts, assistant |

Third-party libraries are loaded from CDNs (Leaflet; `@supabase/supabase-js` as an ES module).

## The deployed site (`design/`)

`design/` holds a snapshot of the compiled Climax landing page served at
<https://site-345b653777cc47a9840dad78fcf8a262.freebuff.page>, committed 2026-11-04.

It is minified build output (`assets/index-*.js`, `assets/index-*.css`) with no source maps, so
the original source cannot be recovered from this repo — treat those files as an opaque artifact.
Make changes in the site's own source project, then refresh the snapshot; the hashed filenames
change on every build.

The only difference from the deployed copy is that `index.html` uses relative asset paths
(`assets/…`, `favicon.svg`) instead of absolute ones, so the folder is self-contained and does
not collide with this app's own `assets/`. Serve it from the repo root:

```bash
python -m http.server 8000   # then open http://localhost:8000/design/
```

Two caveats when running the static copy: the deployed site's `/api/subscribe` endpoint comes
from its host and does not exist here, so the pilot form will fail; everything else (Google
Fonts, runtime hazard feeds) behaves as it does live.

## Notes & roadmap

- Calling the Anthropic API from the browser exposes the key to that browser's user; it's
  fine for a personal MVP. For production, proxy requests through a small backend so the key
  stays server-side.
- The "prediction" layer currently combines live event proximity with short-range weather
  forecasts into a risk score. Natural next steps: historical baselines, trajectory/forecast
  cones for storms, and a trained model behind a backend service.
