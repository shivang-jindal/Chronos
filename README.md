# Chronos

> **The 4D Temporal Earth Engine — scrub 40 years of planetary change, then forecast what comes next.**

[![CI](https://github.com/shivang-jindal/Chronos/actions/workflows/ci.yml/badge.svg)](https://github.com/shivang-jindal/Chronos/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-lightgrey)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vite.dev/)

---

## What it is

Chronos is a temporal Earth observation workbench. Every satellite layer is a
function of time: move the timeline and the planet changes underneath you.
Ask the assistant what comes next and get a deterministic, reproducible
forecast with confidence bounds — not a black box.

The repository is a complete open-source product:

- **Client** — React 18, Vite 6, TypeScript, Tailwind v4, React Router, TanStack Query
- **Server** — Express 4, Zod-validated API, structured logging, security middleware
- **Shared** — one Zod schema/constant source of truth for both runtime and types

The analysis engine is written as pure functions (`server/src/domain/engine.ts`)
so identical requests always produce identical results. That makes every
endpoint cacheable, auditable, and testable; production deployments swap the
internals for tiled raster / ML inference services without changing contracts.

---

## Features

### Temporal globe
1. **4D timeline** — scrub 1984 → 2050 at year, quarter, month, week, or day resolution.
2. **Animation controls** — play, pause, reverse, and speed from 0.25× to 10×.
3. **Comparison mode** — pin two years and compare them side by side.
4. **Layer catalogue** — Landsat, Sentinel-2, Planet NICFI, night lights, urban extents, water, glaciers, coastlines, cropland, sea ice, fire, precipitation, temperature.
5. **Visualization styles** — natural, false colour, NDVI/EVI/SAVI, NDWI/MNDWI, NDBI, NBR/dNBR, NDSI, thermal, night lights, and false-colour composites.
6. **Opacity and per-layer toggles** — build a custom stack without losing state.
7. **Shareable views** — encode camera, time, and layers into a URL-safe token.
8. **Embed mode** — copy an iframe snippet for any saved view.

### Change detection
9. **Five algorithms** — CCDC, LandTrendr, BFAST, dynamic world, and classic differencing.
10. **Typed change events** — deforestation, urbanization, water change, glacier retreat, coastal erosion, fire, agriculture expansion, and more.
11. **Confidence thresholds and minimum area filters** — no noise polygons.
12. **Per-type and per-confidence summaries** — counts and hectare totals for reporting.

### Forecasting
13. **Horizon forecasts** — 1–50 years with lower/upper confidence bounds.
14. **Multiple models** — Earthformer, Prithvi, ConvLSTM, U-Net, random forest, and linear trend, with scenario conditioning.
15. **Ensemble metadata** — confidence level, ensemble size, and processing time reported with every result.

### Scenarios
16. **SSP pathways and policy levers** — carbon pricing, protected areas, reforestation, irrigation efficiency, and urban density.
17. **Per-layer scenario outputs** — one asset descriptor per requested layer at the horizon year.
18. **Region and base-year control** — evaluate any bbox back to 1984.

### Assistant and workflow
19. **Intent-aware AI assistant** — maps natural language to globe actions (add layer, set style, run analysis, create scenario, fly to).
20. **Deterministic, offline-first core** — no external keys required to run, test, or demo the product; connect real providers through configuration.

---

### Workbench: saved work and real deliverables

The workbench is the product's centre of gravity, not a demo panel:

- **Projects** — a named area, window, detector, confidence threshold, and minimum area, stored server-side in `server/.data/workspace.json`.
- **Stored runs** — every execution keeps its result, duration, source mode, and optional note, so the brief survives a reload and can be compared later.
- **Exports** — CSV, JSON, a self-contained printable HTML brief, and a `gods-eye/1` envelope for the other four league apps.
- **Provenance** — each brief records the provider, whether it was `live`, `embedded`, or `cache`, and the exact generation time.
- **Live or embedded data** — `SOURCE_MODE=live` queries NASA EONET open events with a 5 s timeout and 10-minute TTL; the committed embedded snapshot keeps clones, CI, and offline machines deterministic.
- **Interop** — a native Chronos envelope round-trips exactly; an envelope from a sibling app is narrowed to the area-of-interest hint it carries.

```bash
# Optional: query the live NASA EONET feed instead of the embedded snapshot.
SOURCE_MODE=live npm run dev
```

The JSON store is intentional: it needs no service, no native module, and no
migration step, while the route layer only depends on the store's method
surface, so a Postgres implementation can drop in later.

---

## Quick start

Prerequisites: **Node 20.11+**, **npm 10+**.

```bash
git clone https://github.com/shivang-jindal/Chronos.git
cd Chronos
npm install
npm run dev
```

- Web: <http://localhost:5173>
- API: <http://localhost:4000/health>

Copy `.env.example` to `.env` to change ports, CORS origins, or logging.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | API + web with prefixed output |
| `npm run dev:server` | API only (tsx watch) |
| `npm run dev:client` | Vite dev server only |
| `npm run typecheck` | Shared build, then server and client type-checks |
| `npm run lint` | ESLint over the whole workspace |
| `npm test` | Vitest unit + integration suite |
| `npm run build` | Production build for shared, server, and client |
| `npm run verify` | The full gate: typecheck → lint → test → build |
| `npm run smoke` | Post-deployment smoke test against a running API |

---

## API

All endpoints are under `/api/v1` and validate input with Zod.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness/uptime probe |
| `GET` | `/api/v1/version` | Service name and API version |
| `GET` | `/api/v1/capabilities` | Layers, styles, formats, models |
| `GET` | `/api/v1/layers` | Temporal layer catalogue |
| `POST` | `/api/v1/change-detection` | Run a change-detection analysis |
| `POST` | `/api/v1/forecasting` | Generate a horizon forecast |
| `POST` | `/api/v1/scenarios` | Evaluate a policy scenario |
| `POST` | `/api/v1/share-links` | Encode a shareable view |
| `GET` | `/api/v1/share-links/:token` | Decode a shareable view |
| `POST` | `/api/v1/ai/chat` | Assistant reply + globe actions |
| `GET` | `/api/v1/workspace` | Projects, runs, and source status |
| `GET` | `/api/v1/sources` | Data provider status |
| `POST` | `/api/v1/sources/refresh` | Refresh the live provider (or re-affirm the snapshot) |
| `GET` | `/api/v1/projects` | List saved projects |
| `POST` | `/api/v1/projects` | Save a named project |
| `GET/PATCH/DELETE` | `/api/v1/projects/:id` | Read, rename, reconfigure, or delete |
| `POST` | `/api/v1/projects/:id/runs` | Run the project into a stored brief |
| `GET` | `/api/v1/projects/:id/runs` | Run history |
| `GET` | `/api/v1/runs/:id` | One stored run |
| `GET` | `/api/v1/projects/:id/export?format=csv\|json` | Download the latest brief |
| `GET` | `/api/v1/projects/:id/brief` | Printable HTML brief |
| `GET` | `/api/v1/projects/:id/envelope` | Portable `gods-eye/1` envelope |
| `POST` | `/api/v1/league/import` | Import an envelope from any league app |

Validation failures return `400` with a machine-readable `issues` array.
Unknown routes return a structured `404`. Unexpected failures never leak
internals — the client sees `INTERNAL_ERROR` and the server logs the details.

---

## Architecture

```
Chronos/
├── client/                 # React 18 + Vite 6 + Tailwind v4
│   └── src/
│       ├── components/     # shell, timeline, layers, modals, globe
│       ├── pages/          # globe, change detection, forecasting, scenarios, AI, data, settings
│       └── store/          # Zustand store (persisted view state)
├── server/
│   └── src/
│       ├── domain/engine.ts  # deterministic analysis + assistant
│   ├── domain/workbench.ts # stored change brief
│   ├── providers/          # live feed + embedded snapshot
│   ├── store/              # atomic JSON persistence
│       ├── http/             # routes and middleware
│       └── app.ts            # testable Express factory
├── shared/                 # Zod schemas, constants, derived types
└── scripts/                # dev launcher, verify pipeline, smoke test
```

The server exports `createApp({ config, logger })` so integration tests exercise
the real middleware stack without binding a port.

---

## Testing

40 tests cover the deterministic engine, validation, error handling, workspace
persistence, exports, league envelopes, and every public endpoint:

```bash
npm test
```

Tests use Vitest and Supertest against the real Express app with rate limiting
disabled for the `test` environment.

---

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and
the [Code of Conduct](CODE_OF_CONDUCT.md). Security reports go through
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Shivang Jindal
