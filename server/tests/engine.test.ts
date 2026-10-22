import { describe, expect, it } from 'vitest';
import {
  changeDetectionResultSchema,
  forecastingResultSchema,
  scenarioResultSchema,
  shareLinkPayloadSchema
} from '@chronos/shared';

import {
  createRng,
  decodeShareLink,
  detectChanges,
  encodeShareLink,
  evaluateScenario,
  forecast,
  hashSeed,
  respondToChat
} from '../src/domain/engine.js';

const changeRequest = {
  layer: 'landsat_annual' as const,
  startDate: '2000-01-01',
  endDate: '2024-12-31',
  bbox: { west: -70, south: -10, east: -50, north: 5 },
  algorithm: 'ccdc' as const,
  confidenceThreshold: 0.6,
  minAreaHa: 0.1,
  outputFormat: 'geojson' as const
};

describe('deterministic primitives', () => {
  it('hashes strings stably and distinguishes inputs', () => {
    expect(hashSeed('chronos')).toBe(hashSeed('chronos'));
    expect(hashSeed('chronos')).not.toBe(hashSeed('chrono'));
  });

  it('produces repeatable pseudo-random sequences', () => {
    const a = createRng(42);
    const b = createRng(42);
    const first = [a(), a(), a()];
    const second = [b(), b(), b()];
    expect(first).toEqual(second);
    for (const value of first) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('detectChanges', () => {
  it('returns a schema-valid, deterministic report', () => {
    const first = detectChanges(changeRequest);
    const second = detectChanges(changeRequest);

    expect(changeDetectionResultSchema.safeParse(first).success).toBe(true);
    expect(first.changes.length).toBeGreaterThan(0);
    expect(first.summary.totalChanges).toBe(first.changes.length);
    expect(second.summary.totalChanges).toBe(first.summary.totalChanges);
    expect(second.summary.totalAreaHa).toBe(first.summary.totalAreaHa);
  });

  it('honours the confidence threshold and minimum area', () => {
    const result = detectChanges({ ...changeRequest, confidenceThreshold: 0.8, minAreaHa: 5 });
    for (const change of result.changes) {
      expect(change.confidence).toBeGreaterThanOrEqual(0.8);
      expect(change.areaHa).toBeGreaterThanOrEqual(5);
    }
  });

  it('restricts change types when requested', () => {
    const result = detectChanges({ ...changeRequest, changeTypes: ['fire'] });
    expect(result.changes.every((change) => change.type === 'fire')).toBe(true);
  });
});

describe('forecast', () => {
  it('produces the requested horizon with bounded intervals', () => {
    const result = forecast({
      layer: 'sea_ice_annual',
      location: { type: 'point', coordinates: [0, 80] },
      horizonYears: 5,
      model: 'earthformer',
      confidenceLevel: 0.9,
      ensembleSize: 25,
      outputFormat: 'cog'
    });

    expect(forecastingResultSchema.safeParse(result).success).toBe(true);
    expect(result.predictions).toHaveLength(5);
    for (const prediction of result.predictions) {
      expect(prediction.lowerBound).toBeLessThanOrEqual(prediction.value);
      expect(prediction.upperBound).toBeGreaterThanOrEqual(prediction.value);
    }
  });
});

describe('evaluateScenario', () => {
  it('emits an output per requested layer', () => {
    const result = evaluateScenario({
      name: 'Net zero 2050',
      type: 'aggressive_mitigation',
      baseYear: 2024,
      horizonYear: 2050,
      layers: ['landsat_annual', 'urban_extents_annual'],
      ensembleSize: 10,
      outputFormat: 'cog'
    });

    expect(scenarioResultSchema.safeParse(result).success).toBe(true);
    expect(result.outputs).toHaveLength(2);
    expect(result.outputs[0]?.year).toBe(2050);
  });
});

describe('share links', () => {
  const payload = shareLinkPayloadSchema.parse({
    lat: 12.5,
    lon: 77.5,
    zoom: 6,
    time: { mode: 'single', value: '2020-01-01' },
    layers: [{ id: 'landsat_annual', visible: true, opacity: 1, style: 'natural' }]
  });

  it('round-trips a validated payload', () => {
    const token = encodeShareLink(payload);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeShareLink(token)).toEqual(payload);
  });

  it('rejects garbage tokens', () => {
    expect(() => decodeShareLink('not-a-token')).toThrow();
  });
});

describe('respondToChat', () => {
  it('maps intents to globe actions', () => {
    const answer = respondToChat({ message: 'Show me Amazon deforestation since 2000', model: 'gpt-4o', temperature: 0.3, maxTokens: 500 });
    expect(answer.message.toLowerCase()).toContain('deforestation');
    expect(answer.actions?.some((action) => action.type === 'add_layer')).toBe(true);
  });

  it('falls back gracefully for unknown intents', () => {
    const answer = respondToChat({ message: 'hello there', model: 'gpt-4o', temperature: 0.3, maxTokens: 200 });
    expect(answer.actions?.[0]?.type).toBe('fly_to');
    expect(answer.conversationId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
