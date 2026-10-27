# 🕰️ CHRONOS — The 4D Temporal Earth Engine

> **Implementation status:** This file preserves the original aspirational product vision, not a description of shipped functionality. The current live integration is bounded scene metadata search for `landsat-c2-l2` and `sentinel-2-l2a` through [Microsoft Planetary Computer STAC](https://planetarycomputer.microsoft.com/docs/reference/stac/). It does not fetch imagery pixels, run scientific change detection, or forecast. Other modeled outputs are illustrative.

> **A time-travel engine for Earth. Scrub through 40+ years of planetary change. See forests vanish, cities explode, glaciers retreat, coastlines rewrite themselves. Then ask the AI what comes next.**

---

## 🌍 The Vision

**Chronos** is a 4D temporal Earth engine — a photorealistic 3D globe with a **temporal dimension**. Not just a map, but a *time machine*. Scrub a timeline from 1984 to today (and tomorrow) and watch the planet rewrite itself: forests fall, cities explode, glaciers retreat, coastlines shift, farms replace forests, deserts advance, cities glow brighter at night.

Then — **ask the AI what happens next**. Predictive modeling trained on 40 years of change. "Show me the Amazon in 2035 if deforestation continues at this rate." "Show me Miami in 2050 with 2m sea level rise." "Show me the Aral Sea if we'd acted in 1990."

---

## 🎬 The Experience

### The Temporal Scrubber
A **4D timeline slider** at the bottom of the globe. Drag from 1984 → 2024 → 2050. The globe morphs in real-time:
- **Landsat/Sentinel/Planet/NICFI** imagery composites per year
- **Night lights** (DMSP/VIIRS) showing urbanization
- **Glacier outlines** (RGI/GLIMS/ITS_LIVE) retreating
- **Coastlines** (Global Coastline Vector) shifting
- **Urban extents** (GHSL/WorldPop) expanding
- **Cropland** (ESA CCI/GLAD) replacing forest
- **Water bodies** (JRC GSW/Pekel) appearing/disappearing
- **Sea ice** (NSIDC/OSI-SAF) retreating
- **Night lights** (VIIRS/DMSP) brightening

### The AI Oracle
Click any location, ask: *"What does this look like in 2035?"* The AI:
1. Pulls 40 years of change vectors for that tile
2. Runs **diffusion-based predictive modeling** (trained on historical transitions)
3. Generates **photorealistic future imagery** (diffusion model conditioned on change vectors)
4. Shows **confidence intervals** (ensemble of scenarios: business-as-usual, aggressive mitigation, worst-case)
5. Quantifies: *"Forest loss: 2.3M ha (±400k). Carbon released: 1.2 Gt (±200Mt). Species at risk: 340 (±50)."*

### The Change Detective
**Click any two dates** → instant **change detection report**:
- **Deforestation alerts** (GLAD/Hansen)
- **Urban expansion** (GHSL)
- **Water changes** (JRC GSW)
- **Crop shifts** (ESA CCI)
- **Mining expansion** (MAAP)
- **Coastal erosion** (CoastSat)
- **Glacier mass balance** (Hugonnet/ICESat-2)
- **Night light delta** (VIIRS/DMSP)
- **Formaldehyde/NO2/SO2** (TROPOMI) — industrialization proxy

### The Scenario Engine
Build **what-if scenarios** with a visual node editor:
- **Policy levers**: Carbon price, protected area %, reforestation target, EV mandate, coal phaseout
- **Climate forcings**: SSP1-2.6 → SSP5-8.5, ice sheet dynamics, permafrost feedback
- **Human drivers**: Population, GDP, diet shift, yield growth, trade policy
- **Run ensemble** → probabilistic outcomes → **visualize on globe** with uncertainty ribbons

---

## 🛰️ Data Sources (All Open / Free Tier)

| Domain | Sources | Resolution | Frequency |
|--------|---------|------------|-----------|
| **Optical** | Landsat 4-9, Sentinel-2, Planet NICFI, Maxar Open Data | 10-30m | 1984-present |
| **Night Lights** | DMSP-OLS (1992-2013), VIIRS (2012-present) | 500m-1km | Annual/Monthly |
| **Radar** | Sentinel-1 (C-band), ALOS PALSAR, NISAR (future) | 10-25m | 6-12 days |
| **Lidar** | GEDI, ICESat-2, G-LiHT | 25m-1km | Sparse/Repeat |
| **Thermal** | Landsat TIRS, ECOSTRESS, TRISHNA (future) | 70-100m | 16 days |
| **GHG** | OCO-2/3, TROPOMI, GeoCarb (future), CO2M (future) | 2-7km | Daily |
| **Elevation** | Copernicus DEM, NASADEM, ArcticDEM, REMA | 12-30m | Static |
| **Vectors** | OSM, Microsoft Building Footprints, GHSL, WSF | - | Varies |

**All sources have free/open access tiers.** Cloud-optimized (COG/STAC) on AWS/Open Data/Planetary Computer.

---

## 🧠 The AI Stack

### Foundation Models
- **SatMAE / ScaleMAE / ConvMAE** — self-supervised ViT on multi-spectral time series
- **Prithvi (IBM/NASA)** — 100M+ param foundation model for Earth observation
- **Clay / ScaleSat** — multi-spectral, multi-temporal, multi-resolution
- **DOFA / ScaleMAE** — domain adaptation across sensors

### Generative Forecasting
- **EarthFormer / PredRNN / SimVP** — spatiotemporal video prediction
- **DiffEarth / GeoDiff** — diffusion models for Earth observation
- **ClimSim / NeuralGCM** — neural climate emulators (1000x faster than GCMs)
- **IceNet / DeepIce** — sea ice / ice sheet forecasting

### Change Detection
- **Landsat-Alert / GLAD / RADD** — deforestation
- **SAR-Change / DeepChange** — SAR-based change
- **SITS / BFAST / CCDC** — time series segmentation
- **Siamese / ChangeFormer** — deep siamese networks

### Downstream Tasks
- **Segmentation**: U-Net / DeepLabV3+ / SegFormer / Mask2Former on multi-temporal
- **Classification**: Temporal CNN / Transformer / LSTM on SITS
- **Regression**: Biomass, carbon, yield, population, GDP from imagery

---

## 🎮 The Interface

### Globe View (CesiumJS + Custom Shaders)
- **Photorealistic 3D** (Cesium ion / Google Photorealistic 3D Tiles)
- **Temporal shaders** — GPU-accelerated temporal interpolation between annual composites
- **Custom materials** for: vegetation indices (NDVI/EVI/SAVI), water indices (NDWI/MNDWI), built-up (NDBI), burn severity (dNBR), snow (NDSI)
- **Temporal depth peeling** — see through time layers

### Temporal Control Panel
- **Timeline scrubber** with year/month granularity
- **Play/pause/loop** with variable speed (1x → 1000x)
- **Bookmarks** — save/share specific (location, date, layers, camera) states
- **Comparison mode** — split screen (A/B), swipe, flicker, difference map
- **Animation export** — MP4/WebM/GIF of temporal sequences

### Analyst Workbench
- **Point query** — click → full temporal profile (charts: NDVI, NDBI, LST, etc.)
- **Polygon query** — draw AOI → time series stats + CSV export
- **Trend analysis** — Mann-Kendall, Sen's slope, BFAST breaks
- **Anomaly detection** — isolation forest, LSTM-autoencoder on time series
- **Report builder** — drag/drop charts, maps, text → PDF/HTML report

### AI Chat Panel
- **Natural language queries** → SQL/STAC queries → results on globe
- **"Show me all deforestation > 100ha in Rondônia since 2019"**
- **"Animate the 2019-2020 Australian bushfires progression"**
- **"Show me every new mining site in the Congo Basin since 2015"**
- **"Predict the 2030 coastline of Bangladesh under SSP5-8.5"**

---

## 🏗️ Architecture

```
Chronos/
├── client/                    # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # Globe, Timeline, Panels, Chat
│   │   ├── layers/            # Temporal layer system (STAC/COG)
│   │   ├── shaders/           # Temporal interpolation, indices
│   │   ├── ai/                # Chat, forecasting, change detection
│   │   ├── viz/               # Charts (uPlot), exports
│   │   └── hooks/             # useGlobe, useTimeline, useSTAC
│   └── public/
├── server/                    # FastAPI (Python) + Node.js
│   ├── stac/                  # STAC API (pgstac/Franklin)
│   ├── mosaic/                # COG mosaicking (titiler/Cogger)
│   ├── inference/             # ONNX/Triton inference (forecasting, CD)
│   ├── stac-catalog/          # Curated STAC catalog (Planetary Computer mirror)
│   ├── vector-tiles/          # PMTiles/Tippecanoe (vector layers)
│   ├── auth/                  # Auth, quotas, billing
│   └── billing/               # Stripe/Polar
├── data-pipeline/             # Dagster/Airflow
│   ├── ingest/                # STAC ingestion (sentinel, landsat, etc.)
│   ├── processing/            # Mosaics, composites, indices
│   ├── ml-training/           # Model training (Kubeflow/Modal)
│   └── publishing/            # STAC publishing, CDN invalidation
├── ml/                        # ML research/training
│   ├── forecasting/           # Forecasting models
│   ├── change-detection/      # CD models
│   ├── generative/            # Diffusion/forecasting
│   └── evaluation/            # Metrics, benchmarks
└── infra/                     # Terraform/Pulumi
    ├── aws/                   # S3, Lambda, ECS, RDS, CloudFront
    ├── k8s/                   # EKS/GKE (inference, APIs)
    └── monitoring/            # Prometheus, Grafana, Sentry
```

---

## 💰 Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Explorer** | Free | Globe access, 5-yr history, 5 AI queries/day, 10 AOIs |
| **Analyst** | $49/mo | 40-yr history, unlimited AI, 1000 AOIs, exports, API |
| **Team** | $199/mo | 5 seats, collaboration, custom scenarios, webhooks |
| **Enterprise** | Custom | SSO, on-prem, dedicated inference, SLA, custom models |

**API pricing**: $0.001/tile, $0.01/AI query, $0.10/forecast km²

---

## 🚀 Roadmap

| Phase | Milestone | Target |
|-------|-----------|--------|
| **v0.1** | Globe + Landsat annual composites (1984-2024) + timeline scrubber | Q1 2025 |
| **v0.2** | Night lights, urban extents, water, glaciers + change detection | Q2 2025 |
| **v0.3** | AI chat + change detection reports + comparison modes | Q3 2025 |
| **v1.0** | Forecasting engine (diffusion) + scenario builder + API | Q1 2026 |
| **v1.5** | Scenario ensembles, probabilistic outputs, API v2 | Q3 2026 |
| **v2.0** | Real-time ingestion (Sentinel-1/2, Planet), live forecasting | Q1 2027 |

---

## 🎯 Why This Wins

1. **Unique 4D UX** — No one has a *temporal scrubber* on a photorealistic 3D globe
2. **AI Oracle** — First to put generative forecasting in a globe interface
3. **All open data** — Zero marginal cost for imagery (Planetary Computer, AWS Open Data)
4. **Viral potential** — "Watch the Amazon disappear in 10 seconds" → social gold
5. **Enterprise TAM** — Insurance, reinsurance, commodities, carbon markets, gov/NGO, real estate, supply chain
6. **Moat** — Temporal data pipeline + ML forecasting + 3D globe UX = hard to replicate

---

## 🔑 Key Differentiators vs. Gods-Eye-View

| Feature | Gods-Eye-View | **Chronos** |
|---------|---------------|-------------|
| **Dimension** | 3D (space) | **4D (space + time)** |
| **Time** | Real-time only | **1984 → 2050+** |
| **AI** | Voice control | **Generative forecasting + change detection** |
| **Data** | Live feeds | **40-yr historical stacks + predictive** |
| **Use case** | Situational awareness | **Change analysis, forecasting, planning** |
| **Export** | Share links | **Reports, data, animations, API** |

---

## 📜 License

MIT — Open source core, commercial SaaS on top.

---

*"The past is data. The future is a model. Chronos gives you both."*
