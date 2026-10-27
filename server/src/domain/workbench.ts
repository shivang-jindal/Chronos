/**
 * The Chronos workbench job: turn a saved change-detection configuration into
 * a brief an analyst can hand on.
 *
 * The detection itself is the deterministic engine already used by the
 * `/change-detection` endpoint. What the brief adds is the part that makes the
 * output usable: areas by change type, a confidence split, the largest events
 * with their centroids, and a check against the live natural-event feed for
 * anything currently burning or flooding inside the same area of interest.
 */

import {
  changeBriefResultSchema,
  type ChangeBriefResult,
  type ProjectConfig
} from '@chronos/shared';

import { detectChanges } from './engine.js';
import type { SourceEvent, SourceSnapshot } from '../providers/sources.js';

const DEFAULT_BBOX = { west: -180, south: -60, east: 180, north: 80 };

function centroidOf(ring: number[][]): { lat: number; lon: number } {
  if (ring.length === 0) return { lat: 0, lon: 0 };
  let lon = 0;
  let lat = 0;
  for (const point of ring) {
    lon += point[0] ?? 0;
    lat += point[1] ?? 0;
  }
  return {
    lon: Number((lon / ring.length).toFixed(4)),
    lat: Number((lat / ring.length).toFixed(4))
  };
}

function overlaps(
  bbox: { west: number; south: number; east: number; north: number },
  event: SourceEvent
): boolean {
  return (
    event.lon >= bbox.west &&
    event.lon <= bbox.east &&
    event.lat >= bbox.south &&
    event.lat <= bbox.north
  );
}

function formatHa(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} ha`;
}

export function buildChangeBrief(
  config: ProjectConfig,
  source: SourceSnapshot
): { summary: string; output: ChangeBriefResult; provider: string } {
  const result = detectChanges(config);
  const bbox = config.bbox ?? DEFAULT_BBOX;

  const byType = Object.entries(result.summary.byType)
    .map(([type, count]) => {
      const areaHa = result.changes
        .filter((change) => change.type === type)
        .reduce((sum, change) => sum + change.areaHa, 0);
      return { type, count, areaHa: Number(areaHa.toFixed(2)) };
    })
    .sort((a, b) => b.areaHa - a.areaHa);

  const events = result.changes
    .map((change) => {
      const ring = change.geometry.coordinates[0] ?? [];
      return {
        id: change.id,
        type: change.type,
        areaHa: change.areaHa,
        confidence: change.confidence,
        centroid: centroidOf(ring)
      };
    })
    .sort((a, b) => b.areaHa - a.areaHa)
    .slice(0, 8);

  const overlapping = source.events.filter((event) => overlaps(bbox, event));
  const leadType = byType[0];
  const low = result.summary.byConfidence.low ?? 0;
  const medium = result.summary.byConfidence.medium ?? 0;
  const high = result.summary.byConfidence.high ?? 0;
  const confidenceTotal = low + medium + high;

  const headline = [
    `${result.summary.totalChanges} change${result.summary.totalChanges === 1 ? '' : 's'} across ${formatHa(result.summary.totalAreaHa)}`,
    leadType ? `led by ${leadType.type.replace(/_/g, ' ')}` : '',
    `${confidenceTotal > 0 ? Math.round((high / confidenceTotal) * 100) : 0}% high confidence`
  ]
    .filter(Boolean)
    .join(', ');

  const overlapNote =
    overlapping.length > 0
      ? ` ${overlapping.length} open natural event${overlapping.length === 1 ? '' : 's'} ${overlapping.length === 1 ? 'overlaps' : 'overlap'} the area of interest.`
      : '';

  const output = changeBriefResultSchema.parse({
    headline: `${headline}.${overlapNote}`,
    totalChanges: result.summary.totalChanges,
    totalAreaHa: Number(result.summary.totalAreaHa.toFixed(2)),
    byType,
    confidence: {
      low,
      medium,
      high
    },
    events,
    source: {
      id: source.id,
      label: source.label,
      mode: source.mode,
      fetchedAt: source.fetchedAt,
      note: source.note
    },
    generatedAt: new Date().toISOString()
  });

  return {
    summary: output.headline,
    output,
    provider: source.label
  };
}
