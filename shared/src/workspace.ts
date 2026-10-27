/**
 * Workspace contracts shared by the client and the server.
 *
 * A project is a named, reusable configuration. A run is one execution of that
 * configuration, stored with its result so the work survives a page reload and
 * can be exported or handed to another app in the league.
 *
 * The `LeagueEnvelope` is the interchange format between the five Gods-Eye
 * apps: it is deliberately loose, carrying the app kind and an opaque payload
 * that the receiving app validates against its own schema.
 */

import { z } from 'zod';

import { changeDetectionRequestSchema } from './schemas.js';

export const LEAGUE_KINDS = [
  'chronos',
  'biosphere',
  'cyberscape',
  'neuralcartographer',
  'quantumnexus'
] as const;

export type LeagueKind = (typeof LEAGUE_KINDS)[number];

/** This repository's identity inside the league. */
export const APP_KIND: LeagueKind = 'chronos';
export const APP_NAME = 'Chronos';
export const APP_VERSION = '1.1.0';

export const WORKSPACE_FORMAT = 'gods-eye/1';

export const sourceModeSchema = z.enum(['live', 'embedded', 'cache']);
export type SourceMode = z.infer<typeof sourceModeSchema>;

export const sourceStatusSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
  mode: sourceModeSchema,
  fetchedAt: z.string().nullable(),
  recordCount: z.number().int().nonnegative(),
  note: z.string().nullable(),
  configuredMode: z.enum(['live', 'embedded'])
});

export type SourceStatus = z.infer<typeof sourceStatusSchema>;

/** The configuration a Chronos project stores: one change-detection request. */
export const projectConfigSchema = changeDetectionRequestSchema;
export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export const changeBriefEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  areaHa: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  centroid: z.object({
    lat: z.number(),
    lon: z.number()
  })
});

export const changeBriefResultSchema = z.object({
  headline: z.string(),
  totalChanges: z.number().int().nonnegative(),
  totalAreaHa: z.number().nonnegative(),
  byType: z.array(
    z.object({
      type: z.string(),
      count: z.number().int().nonnegative(),
      areaHa: z.number().nonnegative()
    })
  ),
  confidence: z.object({
    low: z.number().int().nonnegative(),
    medium: z.number().int().nonnegative(),
    high: z.number().int().nonnegative()
  }),
  events: z.array(changeBriefEventSchema),
  source: z.object({
    id: z.string(),
    label: z.string(),
    mode: sourceModeSchema,
    fetchedAt: z.string().nullable(),
    note: z.string().nullable()
  }),
  generatedAt: z.string()
});

export type ChangeBriefResult = z.infer<typeof changeBriefResultSchema>;

export const projectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  config: projectConfigSchema
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const projectPatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  config: projectConfigSchema.optional()
});

export const runInputSchema = z.object({
  note: z.string().trim().max(280).optional()
});

export const workspaceProjectSchema = z.object({
  id: z.string(),
  kind: z.enum(LEAGUE_KINDS),
  name: z.string(),
  config: projectConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  runCount: z.number().int().nonnegative(),
  lastRunAt: z.string().nullable()
});

export type WorkspaceProject = z.infer<typeof workspaceProjectSchema>;

export const changeBriefRunSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  kind: z.enum(LEAGUE_KINDS),
  createdAt: z.string(),
  durationMs: z.number().int().nonnegative(),
  provider: z.string(),
  source: sourceModeSchema,
  summary: z.string(),
  note: z.string().nullable(),
  output: changeBriefResultSchema
});

export type ChangeBriefRun = z.infer<typeof changeBriefRunSchema>;

export const workspaceSnapshotSchema = z.object({
  projects: z.array(workspaceProjectSchema),
  runs: z.array(changeBriefRunSchema),
  sources: z.array(sourceStatusSchema)
});

export type WorkspaceSnapshot = z.infer<typeof workspaceSnapshotSchema>;

export const leagueEnvelopeSchema = z.object({
  format: z.literal(WORKSPACE_FORMAT),
  kind: z.enum(LEAGUE_KINDS),
  name: z.string().min(1).max(120),
  createdAt: z.string(),
  payload: z.record(z.unknown())
});

export type LeagueEnvelope = z.infer<typeof leagueEnvelopeSchema>;

/**
 * The small, app-agnostic part of a project that any other app in the league
 * can understand. `bbox` is the common spatial anchor; `region`, `seed` and
 * `horizon` let the other apps carry whatever they can use.
 */
export const leagueHintSchema = z.object({
  label: z.string().optional(),
  bbox: z.object({
    west: z.number().min(-180).max(180),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    north: z.number().min(-90).max(90)
  }).optional(),
  region: z.string().optional(),
  seed: z.number().int().optional(),
  horizon: z.number().optional()
});

export type LeagueHint = z.infer<typeof leagueHintSchema>;

const BBOX_NAMES: Record<string, { west: number; south: number; east: number; north: number }> = {
  'western europe': { west: -10, south: 36, east: 20, north: 60 },
  'north america': { west: -168, south: 15, east: -52, north: 72 },
  'latin america': { west: -82, south: -56, east: -34, north: 33 },
  'sub-saharan africa': { west: -18, south: -35, east: 52, north: 15 },
  'south asia': { west: 60, south: 5, east: 98, north: 37 },
  'east asia': { west: 98, south: 18, east: 146, north: 53 },
  oceania: { west: 110, south: -48, east: 180, north: -8 },
  'middle east': { west: 25, south: 12, east: 63, north: 42 }
};

function bboxForRegion(region: string | undefined) {
  if (!region) return undefined;
  return BBOX_NAMES[region.trim().toLowerCase()];
}

/** Wrap a local project in the cross-app interchange envelope. */
export function toEnvelope(project: WorkspaceProject): LeagueEnvelope {
  const hint: LeagueHint = {
    label: project.name,
    bbox: project.config.bbox
  };
  return {
    format: WORKSPACE_FORMAT,
    kind: APP_KIND,
    name: project.name,
    createdAt: new Date().toISOString(),
    payload: {
      app: APP_NAME,
      version: APP_VERSION,
      config: project.config,
      hint
    }
  };
}

export interface EnvelopeImport {
  config: ProjectConfig;
  /** `native` means the payload already matched this app's schema exactly. */
  matched: 'native' | 'hint';
}

/**
 * Read a project out of an envelope produced by any app in the league.
 *
 * A native Chronos envelope round-trips exactly. An envelope from a sibling
 * app carries no Chronos config, so we use its spatial hint to place the area
 * of interest and fall back to the default temporal window. That makes an
 * import useful rather than a no-op, without pretending the domains match.
 */
export function configFromEnvelope(envelope: LeagueEnvelope): EnvelopeImport | null {
  const native = projectConfigSchema.safeParse(envelope.payload.config);
  if (native.success) return { config: native.data, matched: 'native' };

  const hint = leagueHintSchema.safeParse(envelope.payload.hint);
  const parsedHint = hint.success ? hint.data : undefined;
  const bbox = parsedHint?.bbox ?? bboxForRegion(parsedHint?.region);
  if (!bbox) return null;

  const config = changeDetectionRequestSchema.safeParse({
    layer: 'landsat_annual',
    startDate: '2020-01-01',
    endDate: '2024-12-31',
    bbox,
    confidenceThreshold: 0.6,
    minAreaHa: 0.1,
    outputFormat: 'geojson'
  });
  if (!config.success) return null;
  return { config: config.data, matched: 'hint' };
}

