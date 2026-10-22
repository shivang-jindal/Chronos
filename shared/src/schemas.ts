/**
 * Zod schemas shared between client and server for Chronos.
 */

import { z } from 'zod';

import {
  TEMPORAL_RESOLUTIONS,
  DATA_LAYERS,
  TEMPORAL_LAYERS,
  CHANGE_TYPES,
  SCENARIO_FORCINGS,
  POLICY_LEVERS,
  CHANGE_DETECTION_ALGORITHMS,
  FORECASTING_MODELS,
  CHANGE_DETECTION_MODELS,
  VISUALIZATION_STYLES,
  SCENARIO_TYPES,
  EXPORT_FORMATS,
  CHANGE_DETECTION_MODELS as CDM,
  FORECASTING_MODELS as FM,
  VISUALIZATION_STYLES as VS,
  SCENARIO_FORCINGS as SF,
  POLICY_LEVERS as PL,
  CHANGE_DETECTION_ALGORITHMS as CDA,
  TEMPORAL_RESOLUTIONS as TR,
  DATA_LAYERS as DL,
  TEMPORAL_LAYERS as TL,
  CHANGE_TYPES as CT
} from './constants.js';

// Re-export all constants for convenience
export {
  TEMPORAL_RESOLUTIONS,
  DATA_LAYERS,
  TEMPORAL_LAYERS,
  CHANGE_TYPES,
  SCENARIO_FORCINGS,
  POLICY_LEVERS,
  CHANGE_DETECTION_ALGORITHMS,
  FORECASTING_MODELS,
  CHANGE_DETECTION_MODELS,
  VISUALIZATION_STYLES,
  SCENARIO_TYPES,
  EXPORT_FORMATS,
  TEMPORAL_RESOLUTIONS as TR,
  DATA_LAYERS as DL,
  TEMPORAL_LAYERS as TL,
  CHANGE_TYPES as CT,
  SCENARIO_FORCINGS as SF,
  POLICY_LEVERS as PL,
  CHANGE_DETECTION_ALGORITHMS as CDA,
  FORECASTING_MODELS as FM,
  CHANGE_DETECTION_MODELS as CDM,
  VISUALIZATION_STYLES as VS,
  SCENARIO_TYPES as ST,
  EXPORT_FORMATS as EF
};

const uuid = z.string().uuid();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)');
const isoTimestamp = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Expected an ISO 8601 timestamp');
const currency = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, 'Expected a 3-letter ISO 4217 currency code');
const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().nonnegative();
const positiveNumber = z.number().positive();
const nonNegativeNumber = z.number().nonnegative();
const prob = z.number().min(0).max(1);
const coordinate = z.number().min(-180).max(180);
const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);
const zoomLevel = z.number().int().min(0).max(22);
const opacity = z.number().min(0).max(1);
const percent = z.number().min(0).max(100);

/**
 * Temporal resolution schema
 */
export const temporalResolutionSchema = z.enum(TEMPORAL_RESOLUTIONS);

/**
 * Data layer schema
 */
export const dataLayerSchema = z.enum(DATA_LAYERS);

/**
 * Temporal layer schema
 */
export const temporalLayerSchema = z.enum(TEMPORAL_LAYERS);

/**
 * Change type schema
 */
export const changeTypeSchema = z.enum(CHANGE_TYPES);

/**
 * Scenario forcing schema
 */
export const scenarioForcingSchema = z.enum(SCENARIO_FORCINGS);

/**
 * Policy lever schema
 */
export const policyLeverSchema = z.enum(POLICY_LEVERS);

/**
 * Change detection algorithm schema
 */
export const changeDetectionAlgorithmSchema = z.enum(CHANGE_DETECTION_ALGORITHMS);

/**
 * Forecasting model schema
 */
export const forecastingModelSchema = z.enum(FORECASTING_MODELS);

/**
 * Change detection model schema
 */
export const changeDetectionModelSchema = z.enum(CHANGE_DETECTION_MODELS);

/**
 * Visualization style schema
 */
export const visualizationStyleSchema = z.enum(VISUALIZATION_STYLES);

/**
 * Scenario type schema
 */
export const scenarioTypeSchema = z.enum(SCENARIO_TYPES);

/**
 * Export format schema
 */
export const exportFormatSchema = z.enum(EXPORT_FORMATS);

/**
 * Temporal resolution enum
 */
export type TemporalResolution = z.infer<typeof temporalResolutionSchema>;
export type DataLayer = z.infer<typeof dataLayerSchema>;
export type TemporalLayer = z.infer<typeof temporalLayerSchema>;
export type ChangeType = z.infer<typeof changeTypeSchema>;
export type ScenarioForcing = z.infer<typeof scenarioForcingSchema>;
export type PolicyLever = z.infer<typeof policyLeverSchema>;
export type ChangeDetectionAlgorithm = z.infer<typeof changeDetectionAlgorithmSchema>;
export type ForecastingModel = z.infer<typeof forecastingModelSchema>;
export type ChangeDetectionModel = z.infer<typeof changeDetectionModelSchema>;
export type VisualizationStyle = z.infer<typeof visualizationStyleSchema>;
export type ScenarioType = z.infer<typeof scenarioTypeSchema>;
export type ExportFormat = z.infer<typeof exportFormatSchema>;

/**
 * Coordinate schema
 */
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180)
});

/**
 * Bounding box schema
 */
export const bboxSchema = z.object({
  west: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90)
}).refine((bbox) => bbox.west < bbox.east && bbox.south < bbox.north, {
  message: 'Invalid bounding box: west must be < east, south must be < north'
});

/**
 * Temporal extent schema
 */
export const temporalExtentSchema = z.object({
  start: isoDate,
  end: isoDate
}).refine((extent) => extent.start <= extent.end, {
  message: 'Temporal extent start must be <= end'
});

/**
 * Spatial extent schema
 */
export const spatialExtentSchema = z.object({
  bbox: bboxSchema,
  crs: z.string().default('EPSG:4326')
});

/**
 * STAC Item schema
 */
export const stacItemSchema = z.object({
  id: z.string(),
  type: z.literal('Feature'),
  stac_version: z.string(),
  stac_extensions: z.array(z.string()).optional(),
  geometry: z.object({
    type: z.enum(['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection']),
    coordinates: z.any()
  }).nullable(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  properties: z.record(z.unknown()),
  assets: z.record(z.object({
    href: z.string().url(),
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    roles: z.array(z.string()).optional(),
    file_size: z.number().int().optional()
  })).optional(),
  links: z.array(z.object({
    href: z.string().url(),
    rel: z.string(),
    type: z.string().optional(),
    title: z.string().optional()
  })).optional(),
  collection: z.string().optional()
});

/**
 * STAC Collection schema
 */
export const stacCollectionSchema = z.object({
  id: z.string(),
  type: z.literal('Collection'),
  stac_version: z.string(),
  stac_extensions: z.array(z.string()).optional(),
  title: z.string().optional(),
  description: z.string(),
  keywords: z.array(z.string()).optional(),
  license: z.string(),
  providers: z.array(z.object({
    name: z.string(),
    roles: z.array(z.enum(['producer', 'processor', 'host', 'licensor'])).optional(),
    url: z.string().url().optional()
  })).optional(),
  extent: z.object({
    spatial: z.object({
      bbox: z.array(z.tuple([z.number(), z.number(), z.number(), z.number()]))
    }).optional(),
    temporal: z.object({
      interval: z.tuple([z.string().nullable(), z.string().nullable()])
    }).optional()
  }).optional(),
  summaries: z.record(z.unknown()).optional(),
  links: z.array(z.object({
    href: z.string().url(),
    rel: z.string(),
    type: z.string().optional(),
    title: z.string().optional()
  })).optional()
});

/**
 * STAC Catalog schema
 */
export const stacCatalogSchema = z.object({
  id: z.string(),
  type: z.literal('Catalog'),
  stac_version: z.string(),
  stac_extensions: z.array(z.string()).optional(),
  title: z.string().optional(),
  description: z.string(),
  links: z.array(z.object({
    href: z.string().url(),
    rel: z.string(),
    type: z.string().optional(),
    title: z.string().optional()
  }))
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(1000).default(100)
});

/**
 * Sort schema
 */
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Filter schema
 */
export const filterSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'startsWith', 'endsWith', 'regex']),
  value: z.unknown()
});

/**
 * Query schema for STAC search
 */
export const stacSearchSchema = z.object({
  collections: z.array(z.string()).optional(),
  ids: z.array(z.string()).optional(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  datetime: z.string().optional(),
  limit: z.number().int().positive().max(10000).default(100),
  query: z.record(z.object({
    eq: z.unknown().optional(),
    neq: z.unknown().optional(),
    gt: z.unknown().optional(),
    gte: z.unknown().optional(),
    lt: z.unknown().optional(),
    lte: z.unknown().optional(),
    in: z.array(z.unknown()).optional(),
    nin: z.array(z.unknown()).optional(),
    contains: z.unknown().optional(),
    startsWith: z.unknown().optional(),
    endsWith: z.unknown().optional()
  })).optional(),
  sortby: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']).default('asc')
  })).optional(),
  filter: z.string().optional(),
  filter_lang: z.enum(['cql2-text', 'cql2-json']).optional()
});

/**
 * Change detection request
 */
export const changeDetectionRequestSchema = z.object({
  layer: temporalLayerSchema,
  startDate: isoDate,
  endDate: isoDate,
  bbox: bboxSchema.optional(),
  algorithm: z.enum(CHANGE_DETECTION_ALGORITHMS).default('ccdc'),
  changeTypes: z.array(z.enum(CHANGE_TYPES)).optional(),
  confidenceThreshold: prob.default(0.6),
  minAreaHa: positiveNumber.default(0.1),
  outputFormat: z.enum(EXPORT_FORMATS).default('geojson')
});

/**
 * Change detection result
 */
export const changeDetectionResultSchema = z.object({
  id: uuid,
  requestId: uuid,
  layer: temporalLayerSchema,
  startDate: isoDate,
  endDate: isoDate,
  algorithm: z.enum(CHANGE_DETECTION_ALGORITHMS),
  changes: z.array(z.object({
    id: uuid,
    type: z.enum(CHANGE_TYPES),
    geometry: z.object({
      type: z.enum(['Polygon', 'MultiPolygon']),
      coordinates: z.array(z.array(z.array(z.number())))
    }),
    areaHa: positiveNumber,
    confidence: prob,
    detectedAt: isoTimestamp,
    properties: z.record(z.unknown()).optional()
  })),
  summary: z.object({
    totalChanges: nonNegativeInt,
    totalAreaHa: nonNegativeNumber,
    byType: z.record(nonNegativeInt),
    byConfidence: z.record(nonNegativeInt)
  }),
  metadata: z.object({
    algorithm: z.string(),
    processingTimeMs: nonNegativeInt,
    tilesProcessed: nonNegativeInt,
    confidenceThreshold: prob,
    minAreaHa: positiveNumber
  }),
  createdAt: isoTimestamp
});

/**
 * Forecasting request
 */
export const forecastingRequestSchema = z.object({
  layer: temporalLayerSchema,
  location: z.object({
    type: z.enum(['point', 'bbox', 'polygon']),
    coordinates: z.union([
      bboxSchema,
      z.tuple([longitude, latitude]),
      z.array(z.array(z.number()))
    ])
  }),
  horizonYears: positiveInt.max(50).default(10),
  model: z.enum(FORECASTING_MODELS).default('earthformer'),
  scenario: z.enum(SCENARIO_FORCINGS).optional(),
  policyLevers: z.record(z.number()).optional(),
  confidenceLevel: z.number().min(0.5).max(0.99).default(0.9),
  ensembleSize: z.number().int().positive().max(1000).default(50),
  outputFormat: z.enum(EXPORT_FORMATS).default('cog')
});

/**
 * Forecasting result
 */
export const forecastingResultSchema = z.object({
  id: uuid,
  requestId: uuid,
  layer: temporalLayerSchema,
  location: z.object({
    type: z.enum(['point', 'bbox', 'polygon']),
    coordinates: z.union([
      bboxSchema,
      z.tuple([longitude, latitude]),
      z.array(z.array(z.number()))
    ])
  }),
  horizonYears: positiveInt,
  model: z.enum(FORECASTING_MODELS),
  scenario: z.enum(SCENARIO_FORCINGS).optional(),
  policyLevers: z.record(z.number()).optional(),
  predictions: z.array(z.object({
    year: positiveInt,
    value: z.number(),
    lowerBound: z.number().optional(),
    upperBound: z.number().optional(),
    confidence: prob
  })),
  metadata: z.object({
    model: z.string(),
    ensembleSize: positiveInt,
    confidenceLevel: prob,
    processingTimeMs: nonNegativeInt,
    uncertaintyMethod: z.string()
  }),
  createdAt: isoTimestamp
});

/**
 * Scenario request
 */
export const scenarioRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  type: z.enum(SCENARIO_TYPES).default('custom'),
  baseYear: z.number().int().min(1984).max(2024).default(2024),
  horizonYear: z.number().int().min(2025).max(2100).default(2050),
  forcings: z.record(z.number()).optional(),
  policyLevers: z.record(z.number()).optional(),
  climateModel: z.enum(SCENARIO_FORCINGS).optional(),
  region: bboxSchema.optional(),
  layers: z.array(z.enum(TEMPORAL_LAYERS)).optional(),
  ensembleSize: z.number().int().positive().max(1000).default(50),
  outputFormat: z.enum(EXPORT_FORMATS).default('cog')
});

/**
 * Scenario result
 */
export const scenarioResultSchema = z.object({
  id: uuid,
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(SCENARIO_TYPES),
  baseYear: z.number().int(),
  horizonYear: z.number().int(),
  forcings: z.record(z.number()).optional(),
  policyLevers: z.record(z.number()).optional(),
  climateModel: z.enum(SCENARIO_FORCINGS).optional(),
  region: bboxSchema.optional(),
  layers: z.array(z.enum(TEMPORAL_LAYERS)).optional(),
  ensembleSize: positiveInt,
  outputs: z.array(z.object({
    layer: temporalLayerSchema,
    year: z.number().int(),
    assetUrl: z.string().url(),
    metadata: z.record(z.unknown())
  })),
  metadata: z.object({
    ensembleSize: positiveInt,
    processingTimeMs: nonNegativeInt,
    uncertaintyMethod: z.string()
  }),
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp
});

/**
 * Export request
 */
export const exportRequestSchema = z.object({
  format: z.enum(EXPORT_FORMATS),
  layer: temporalLayerSchema.optional(),
  bbox: bboxSchema.optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  visualizationStyle: z.enum(VISUALIZATION_STYLES).optional(),
  resolution: positiveNumber.optional(),
  crs: z.string().default('EPSG:4326'),
  compression: z.object({
    enabled: z.boolean().default(true),
    quality: z.number().min(1).max(100).default(85)
  }).optional()
});

/**
 * Animation export request
 */
export const animationExportRequestSchema = z.object({
  format: z.enum(['mp4', 'webm', 'gif']),
  layer: temporalLayerSchema,
  startYear: z.number().int().min(1984).max(2050),
  endYear: z.number().int().min(1984).max(2050),
  fps: z.number().int().positive().max(60).default(10),
  resolution: z.enum(['720p', '1080p', '4k', '8k']).default('1080p'),
  bbox: bboxSchema.optional(),
  visualizationStyle: z.enum(VISUALIZATION_STYLES).default('natural'),
  includeLegend: z.boolean().default(true),
  includeTimeline: z.boolean().default(true),
  includeScaleBar: z.boolean().default(true),
  includeNorthArrow: z.boolean().default(true)
});

/**
 * AI chat request
 */
export const aiChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  context: z.object({
    location: z.object({
      lat: latitude,
      lon: longitude,
      zoom: zoomLevel
    }).optional(),
    layers: z.array(z.enum(TEMPORAL_LAYERS)).optional(),
    timeRange: temporalExtentSchema.optional(),
    activeLayers: z.array(z.string()).optional()
  }).optional(),
  conversationId: uuid.optional(),
  model: z.enum(['gpt-4o', 'gpt-4o-mini', 'gemini-3.8-live']).default('gpt-4o'),
  temperature: prob.default(0.3),
  maxTokens: positiveInt.default(2000)
});

/**
 * AI chat response
 */
export const aiChatResponseSchema = z.object({
  message: z.string(),
  conversationId: uuid,
  actions: z.array(z.object({
    type: z.enum(['fly_to', 'add_layer', 'remove_layer', 'set_time', 'set_style', 'run_analysis', 'create_scenario', 'export_data', 'annotate', 'measure', 'draw']),
    params: z.record(z.unknown())
  })).optional(),
  metadata: z.object({
    model: z.string(),
    tokensUsed: positiveInt,
    latencyMs: nonNegativeInt
  }).optional()
});

/**
 * Scenario builder node
 */
export const scenarioNodeSchema = z.object({
  id: uuid,
  type: z.enum(['forcing', 'policy', 'climate_model', 'region', 'layer', 'ensemble', 'output']),
  label: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.unknown()),
  inputs: z.array(uuid),
  outputs: z.array(uuid)
});

/**
 * Scenario builder edge
 */
export const scenarioEdgeSchema = z.object({
  id: uuid,
  source: uuid,
  target: uuid,
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.enum(['default', 'smoothstep', 'step', 'straight']).default('smoothstep')
});

/**
 * Scenario graph
 */
export const scenarioGraphSchema = z.object({
  nodes: z.array(z.object({
    id: uuid,
    type: z.enum(['forcing', 'policy', 'climate_model', 'region', 'layer', 'ensemble', 'output']),
    label: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.unknown()),
    inputs: z.array(uuid),
    outputs: z.array(uuid)
  })),
  edges: z.array(z.object({
    id: uuid,
    source: uuid,
    target: uuid,
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
    type: z.enum(['default', 'smoothstep', 'step', 'straight']).default('smoothstep')
  })),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number()
  }).optional()
});

/**
 * Share link payload
 */
export const shareLinkPayloadSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  zoom: z.number().int().min(0).max(22),
  bearing: z.number().default(0),
  pitch: z.number().min(0).max(85).default(0),
  time: z.object({
    mode: z.enum(['single', 'range', 'animation']),
    value: z.union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)'),
      z.object({
        start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)'),
        end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)')
      }),
      z.object({
        start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)'),
        end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)'),
        fps: z.number().int().positive().max(60).default(10)
      })
    ]).optional(),
  }).optional(),
  layers: z.array(z.object({
    id: z.string(),
    visible: z.boolean().default(true),
    opacity: z.number().min(0).max(1).default(1),
    style: z.enum(VISUALIZATION_STYLES).optional()
  })).optional(),
  camera: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    zoom: z.number().int().min(0).max(22),
    bearing: z.number().default(0),
    pitch: z.number().min(0).max(85).default(0),
    altitude: z.number().nonnegative().optional()
  }).optional(),
  annotations: z.array(z.object({
    id: uuid,
    type: z.enum(['point', 'line', 'polygon', 'circle', 'rectangle', 'text']),
    geometry: z.object({
      type: z.enum(['Point', 'LineString', 'Polygon', 'Circle', 'Rectangle']),
      coordinates: z.any()
    }),
    properties: z.record(z.unknown())
  })).optional(),
  scenario: uuid.optional()
});

/**
 * Export types
 */
export type UUID = z.infer<typeof uuid>;
export type ISODate = z.infer<typeof isoDate>;
export type ISOTimestamp = z.infer<typeof isoTimestamp>;
export type Coordinate = { lat: number; lon: number };
export type BBox = { west: number; south: number; east: number; north: number };
export type TemporalExtent = { start: string; end: string };
export type SpatialExtent = { bbox: { west: number; south: number; east: number; north: number }; crs?: string };
export type STACItem = z.infer<typeof stacItemSchema>;
export type STACCollection = z.infer<typeof stacCollectionSchema>;
export type STACCatalog = z.infer<typeof stacCatalogSchema>;
export type Pagination = { page: number; pageSize: number };
export type Sort = { field: string; order: 'asc' | 'desc' };
export type Filter = { field: string; operator: string; value: unknown };
export type STACSearch = z.infer<typeof stacSearchSchema>;
export type ChangeDetectionRequest = z.infer<typeof changeDetectionRequestSchema>;
export type ChangeDetectionResult = z.infer<typeof changeDetectionResultSchema>;
export type ForecastingRequest = z.infer<typeof forecastingRequestSchema>;
export type ForecastingResult = z.infer<typeof forecastingResultSchema>;
export type ScenarioRequest = z.infer<typeof scenarioRequestSchema>;
export type ScenarioResult = z.infer<typeof scenarioResultSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;
export type AnimationExportRequest = z.infer<typeof animationExportRequestSchema>;
export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;
export type AIChatResponse = z.infer<typeof aiChatResponseSchema>;
export type ScenarioNode = z.infer<typeof scenarioNodeSchema>;
export type ScenarioEdge = z.infer<typeof scenarioEdgeSchema>;
export type ScenarioGraph = z.infer<typeof scenarioGraphSchema>;
export type ShareLinkPayload = z.infer<typeof shareLinkPayloadSchema>;

/** Role and Permission types */
export type Role = 'owner' | 'admin' | 'member' | 'viewer';
export type Permission = 
  | 'temporal.forecast'
  | 'change.detect'
  | 'scenario.build'
  | 'scenario.run'
  | 'export.create'
  | 'export.download'
  | 'settings.manage'
  | 'member.manage'
  | 'audit.view'
  | 'ownership.transfer'
  | 'organization.delete';

/** Get permissions for a role */
export function permissionsForRole(role: 'owner' | 'admin' | 'member' | 'viewer'): string[] {
  const VIEWER_PERMISSIONS: string[] = [];
  const MEMBER_PERMISSIONS: string[] = [
    'temporal.forecast',
    'change.detect',
    'scenario.build',
    'export.create'
  ];
  const ADMIN_PERMISSIONS: string[] = [
    ...MEMBER_PERMISSIONS,
    'scenario.run',
    'settings.manage',
    'member.manage',
    'audit.view'
  ];
  const OWNER_PERMISSIONS: string[] = [
    ...ADMIN_PERMISSIONS,
    'export.download',
    'ownership.transfer',
    'organization.delete'
  ];
  
  switch (role) {
    case 'owner':
      return [
        'temporal.forecast',
        'change.detect',
        'scenario.build',
        'scenario.run',
        'export.create',
        'export.download',
        'settings.manage',
        'member.manage',
        'audit.view',
        'ownership.transfer',
        'organization.delete'
      ];
    case 'admin':
      return [...ADMIN_PERMISSIONS];
    case 'member':
      return [...MEMBER_PERMISSIONS];
    case 'viewer':
      return [...[]];
  }
}

/** Check if a role has a specific permission */
export function roleHasPermission(role: 'owner' | 'admin' | 'member' | 'viewer', permission: string): boolean {
  return permissionsForRole(role).includes(permission);
}

/** API error types */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'RATE_LIMITED'
  | 'INTEGRATION_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface ApiFieldIssue {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string[]>;
    issues?: { path: string; message: string }[];
    requestId: string;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface MembershipSummary {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  baseCurrency: string;
  timezone: string;
  role: string;
  permissions: string[];
}

export interface AuthSessionResponse {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    createdAt: string;
  };
  memberships: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    baseCurrency: string;
    timezone: string;
    role: string;
    permissions: string[];
  }[];
  activeOrganizationId: string | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}