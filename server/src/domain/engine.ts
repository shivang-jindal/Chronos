/**
 * Chronos analysis engine.
 *
 * Pure, deterministic functions behind every API endpoint. Determinism matters:
 * the same request always yields the same answer, which makes results
 * cacheable, reproducible, and straightforward to test. Real deployments swap
 * the internals for calls to the tiled raster / ML inference services while
 * keeping these contracts.
 */

import { randomUUID } from 'node:crypto';
import {
  CHANGE_TYPES,
  TEMPORAL_LAYERS,
  type ChangeDetectionRequest,
  type ChangeDetectionResult,
  type ForecastingRequest,
  type ForecastingResult,
  type ScenarioRequest,
  type ScenarioResult,
  type ShareLinkPayload,
  type AIChatRequest,
  type AIChatResponse,
  changeDetectionResultSchema,
  forecastingResultSchema,
  scenarioResultSchema,
  shareLinkPayloadSchema,
  aiChatResponseSchema
} from '@chronos/shared';

/** FNV-1a hash, used to derive a stable seed from a request. */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32 PRNG — tiny, fast, deterministic. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number, digits = 6): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function polygonAround(lon: number, lat: number, size: number): number[][][] {
  const half = size / 2;
  return [
    [
      [round(lon - half), round(lat - half)],
      [round(lon + half), round(lat - half)],
      [round(lon + half), round(lat + half)],
      [round(lon - half), round(lat + half)],
      [round(lon - half), round(lat - half)]
    ]
  ];
}

/**
 * Deterministic change detection. Emits polygons inside the requested bbox
 * (or a global sample when no bbox is supplied) with confidence values that
 * respect the caller's threshold.
 */
export function detectChanges(request: ChangeDetectionRequest): ChangeDetectionResult {
  const requestId = randomUUID();
  const seed = hashSeed(JSON.stringify(request));
  const rng = createRng(seed);
  const types = request.changeTypes?.length ? request.changeTypes : [...CHANGE_TYPES];
  const bbox = request.bbox ?? { west: -180, south: -60, east: 180, north: 80 };
  const spanLon = Math.max(0.01, bbox.east - bbox.west);
  const spanLat = Math.max(0.01, bbox.north - bbox.south);
  const count = 4 + Math.floor(rng() * 9);

  const changes = Array.from({ length: count }, () => {
    const type = types[Math.floor(rng() * types.length)] ?? 'deforestation';
    const confidence = round(request.confidenceThreshold + rng() * (1 - request.confidenceThreshold), 4);
    const areaHa = round(Math.max(request.minAreaHa, request.minAreaHa + rng() * 950), 2);
    const lon = bbox.west + rng() * spanLon;
    const lat = bbox.south + rng() * spanLat;
    const size = Math.max(0.01, Math.min(spanLon, spanLat) * (0.01 + rng() * 0.05));

    return {
      id: randomUUID(),
      type,
      geometry: { type: 'Polygon' as const, coordinates: polygonAround(lon, lat, size) },
      areaHa,
      confidence,
      detectedAt: new Date(Date.UTC(2024, 0, 1)).toISOString(),
      properties: { algorithm: request.algorithm, sourceLayer: request.layer }
    };
  });

  const byType: Record<string, number> = {};
  const byConfidence: Record<string, number> = { low: 0, medium: 0, high: 0 };
  let totalAreaHa = 0;

  for (const change of changes) {
    byType[change.type] = (byType[change.type] ?? 0) + 1;
    totalAreaHa += change.areaHa;
    const bucket = change.confidence >= 0.9 ? 'high' : change.confidence >= 0.75 ? 'medium' : 'low';
    byConfidence[bucket] = (byConfidence[bucket] ?? 0) + 1;
  }

  return changeDetectionResultSchema.parse({
    id: randomUUID(),
    requestId,
    layer: request.layer,
    startDate: request.startDate,
    endDate: request.endDate,
    algorithm: request.algorithm,
    changes,
    summary: {
      totalChanges: changes.length,
      totalAreaHa: round(totalAreaHa, 2),
      byType,
      byConfidence
    },
    metadata: {
      algorithm: request.algorithm,
      processingTimeMs: 120 + Math.floor(rng() * 900),
      tilesProcessed: Math.max(1, Math.ceil((spanLon * spanLat) / 25)),
      confidenceThreshold: request.confidenceThreshold,
      minAreaHa: request.minAreaHa
    },
    createdAt: new Date().toISOString()
  });
}

/** Deterministic forecast with confidence bounds. */
export function forecast(request: ForecastingRequest): ForecastingResult {
  const requestId = randomUUID();
  const seed = hashSeed(`${request.layer}:${JSON.stringify(request.location)}:${request.model}`);
  const rng = createRng(seed);
  const startYear = 2024;
  const baseValue = 40 + rng() * 60;
  const trend = (rng() - 0.45) * 2.5;

  const predictions = Array.from({ length: request.horizonYears }, (_, index) => {
    const year = startYear + index + 1;
    const value = round(baseValue + trend * (index + 1) + Math.sin(index / 2) * 2, 3);
    const spread = round(2 + index * 0.8, 3);
    return {
      year,
      value,
      lowerBound: round(value - spread, 3),
      upperBound: round(value + spread, 3),
      confidence: round(request.confidenceLevel, 4)
    };
  });

  return forecastingResultSchema.parse({
    id: randomUUID(),
    requestId,
    layer: request.layer,
    location: request.location,
    horizonYears: request.horizonYears,
    model: request.model,
    scenario: request.scenario,
    policyLevers: request.policyLevers,
    predictions,
    metadata: {
      model: request.model,
      ensembleSize: request.ensembleSize,
      confidenceLevel: request.confidenceLevel,
      processingTimeMs: 200 + Math.floor(rng() * 1200),
      uncertaintyMethod: 'ensemble-quantile'
    },
    createdAt: new Date().toISOString()
  });
}

/** Deterministic scenario evaluation producing one asset per requested layer. */
export function evaluateScenario(request: ScenarioRequest): ScenarioResult {
  const id = randomUUID();
  const now = new Date().toISOString();
  const layers = request.layers?.length ? request.layers : [...TEMPORAL_LAYERS.slice(0, 1)];
  const rng = createRng(hashSeed(`${request.name}:${request.horizonYear}:${request.type}`));

  const outputs = layers.map((layer) => ({
    layer,
    year: request.horizonYear,
    assetUrl: `https://assets.chronos.example/scenarios/${id}/${layer}-${request.horizonYear}.tif`,
    metadata: {
      meanValue: round(30 + rng() * 70, 2),
      uncertainty: round(rng() * 0.2, 3),
      scenarioType: request.type
    }
  }));

  return scenarioResultSchema.parse({
    id,
    name: request.name,
    description: request.description,
    type: request.type,
    baseYear: request.baseYear,
    horizonYear: request.horizonYear,
    forcings: request.forcings,
    policyLevers: request.policyLevers,
    climateModel: request.climateModel,
    region: request.region,
    layers: request.layers,
    ensembleSize: request.ensembleSize,
    outputs,
    metadata: {
      ensembleSize: request.ensembleSize,
      processingTimeMs: 350 + Math.floor(rng() * 1500),
      uncertaintyMethod: 'ensemble-quantile'
    },
    createdAt: now,
    updatedAt: now
  });
}

/** Encode a validated share payload into a URL-safe token. */
export function encodeShareLink(payload: ShareLinkPayload): string {
  const validated = shareLinkPayloadSchema.parse(payload);
  return Buffer.from(JSON.stringify(validated), 'utf8').toString('base64url');
}

/** Decode a share token, throwing a ZodError when the payload is invalid. */
export function decodeShareLink(token: string): ShareLinkPayload {
  const json = Buffer.from(token, 'base64url').toString('utf8');
  return shareLinkPayloadSchema.parse(JSON.parse(json));
}

interface ChatRule {
  keywords: string[];
  message: (message: string) => string;
  actions: AIChatResponse['actions'];
}

const CHAT_RULES: ChatRule[] = [
  {
    keywords: ['deforest', 'forest', 'amazon'],
    message: () => 'Loading the Landsat annual composite and highlighting deforestation hotspots for the selected period.',
    actions: [
      { type: 'add_layer', params: { layer: 'landsat_annual' } },
      { type: 'set_style', params: { style: 'ndvi' } },
      { type: 'run_analysis', params: { analysis: 'change_detection', changeTypes: ['deforestation'] } }
    ]
  },
  {
    keywords: ['sea ice', 'arctic', 'glacier', 'ice'],
    message: () => 'Switching to the sea-ice layer and comparing the selected years with the 1984 baseline.',
    actions: [
      { type: 'add_layer', params: { layer: 'sea_ice_annual' } },
      { type: 'set_style', params: { style: 'ndsi' } }
    ]
  },
  {
    keywords: ['urban', 'city', 'cities', 'growth', 'lagos'],
    message: () => 'Overlaying urban extents and night lights so growth is visible year by year.',
    actions: [
      { type: 'add_layer', params: { layer: 'urban_extents_annual' } },
      { type: 'add_layer', params: { layer: 'night_lights_annual' } },
      { type: 'set_style', params: { style: 'night_lights' } }
    ]
  },
  {
    keywords: ['scenario', 'carbon', 'policy', 'ssp'],
    message: () => 'Opening the scenario builder with carbon pricing enabled so you can compare SSP pathways.',
    actions: [{ type: 'create_scenario', params: { policyLevers: { carbon_price: 50 } } }]
  },
  {
    keywords: ['coast', 'erosion', 'sea level', 'flood'],
    message: () => 'Showing coastline change and flood extent for the selected dates.',
    actions: [
      { type: 'add_layer', params: { layer: 'coastline_annual' } },
      { type: 'run_analysis', params: { analysis: 'change_detection', changeTypes: ['coastal_erosion', 'flood'] } }
    ]
  },
  {
    keywords: ['fire', 'burn', 'wildfire'],
    message: () => 'Enabling the monthly fire layer and burn-severity styling.',
    actions: [
      { type: 'add_layer', params: { layer: 'fire_monthly' } },
      { type: 'set_style', params: { style: 'dnbr' } }
    ]
  }
];

/** Deterministic, intent-aware assistant reply. */
export function respondToChat(request: AIChatRequest): AIChatResponse {
  const lower = request.message.toLowerCase();
  const match = CHAT_RULES.find((rule) => rule.keywords.some((keyword) => lower.includes(keyword)));
  const actions = match ? match.actions : [{ type: 'fly_to' as const, params: { lat: 0, lon: 0, zoom: 2 } }];
  const message = match
    ? match.message(request.message)
    : `I can help with that. Try asking about deforestation, sea ice, urban growth, coastlines, fires, or scenarios. You asked: "${request.message}".`;

  const tokensUsed = Math.max(12, Math.ceil((request.message.length + message.length) / 4));

  return aiChatResponseSchema.parse({
    message,
    conversationId: request.conversationId ?? randomUUID(),
    actions,
    metadata: {
      model: request.model,
      tokensUsed,
      latencyMs: 40 + (hashSeed(lower) % 160)
    }
  });
}
