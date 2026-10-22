import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createLogger } from '../src/logger.js';

const config = loadConfig({
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  PORT: '4100',
  CORS_ORIGIN: 'http://localhost:5173'
} as NodeJS.ProcessEnv);
const logger = createLogger(config);
const app = createApp({ config, logger });

describe('service metadata', () => {
  it('reports health', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.uptimeSeconds).toBe('number');
  });

  it('reports version', async () => {
    const response = await request(app).get('/api/v1/version').expect(200);
    expect(response.body).toMatchObject({ name: 'Chronos', version: '1.0.0', apiVersion: 'v1' });
  });

  it('lists temporal layers', async () => {
    const response = await request(app).get('/api/v1/layers').expect(200);
    expect(Array.isArray(response.body.layers)).toBe(true);
    expect(response.body.layers.length).toBeGreaterThan(5);
    expect(response.body.layers[0]).toEqual(expect.objectContaining({ id: expect.any(String), resolution: 'year' }));
  });

  it('exposes capabilities', async () => {
    const response = await request(app).get('/api/v1/capabilities').expect(200);
    expect(response.body.temporalLayers).toContain('landsat_annual');
    expect(response.body.exportFormats).toContain('cog');
  });
});

describe('change detection', () => {
  const body = {
    layer: 'landsat_annual',
    startDate: '2000-01-01',
    endDate: '2024-12-31',
    bbox: { west: -70, south: -10, east: -50, north: 5 },
    algorithm: 'ccdc',
    confidenceThreshold: 0.7,
    minAreaHa: 0.5,
    outputFormat: 'geojson'
  };

  it('accepts a valid request', async () => {
    const response = await request(app).post('/api/v1/change-detection').send(body).expect(201);
    expect(response.body.summary.totalChanges).toBeGreaterThan(0);
    expect(response.body.layer).toBe('landsat_annual');
  });

  it('rejects invalid dates and layers', async () => {
    const response = await request(app)
      .post('/api/v1/change-detection')
      .send({ ...body, startDate: '2000/01/01', layer: 'unknown_layer' })
      .expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.issues.length).toBeGreaterThan(0);
  });
});

describe('forecasting & scenarios', () => {
  it('creates a forecast', async () => {
    const response = await request(app)
      .post('/api/v1/forecasting')
      .send({
        layer: 'sea_ice_annual',
        location: { type: 'point', coordinates: [0, 80] },
        horizonYears: 4,
        model: 'earthformer',
        confidenceLevel: 0.9,
        ensembleSize: 20,
        outputFormat: 'cog'
      })
      .expect(201);
    expect(response.body.predictions).toHaveLength(4);
  });

  it('creates a scenario', async () => {
    const response = await request(app)
      .post('/api/v1/scenarios')
      .send({ name: 'Mitigation 2050', type: 'aggressive_mitigation', horizonYear: 2050, layers: ['landsat_annual'] })
      .expect(201);
    expect(response.body.name).toBe('Mitigation 2050');
    expect(response.body.outputs).toHaveLength(1);
  });

  it('rejects a horizon beyond the supported range', async () => {
    const response = await request(app)
      .post('/api/v1/scenarios')
      .send({ name: 'Too far', horizonYear: 2200 })
      .expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('share links', () => {
  const payload = {
    lat: 12.5,
    lon: 77.5,
    zoom: 6,
    time: { mode: 'single', value: '2020-01-01' }
  };

  it('creates then retrieves a share link', async () => {
    const created = await request(app).post('/api/v1/share-links').send(payload).expect(201);
    expect(created.body.token).toBeTruthy();

    const fetched = await request(app).get(`/api/v1/share-links/${created.body.token}`).expect(200);
    expect(fetched.body.payload).toMatchObject({ lat: 12.5, lon: 77.5, zoom: 6 });
  });

  it('rejects an invalid token', async () => {
    const response = await request(app).get('/api/v1/share-links/broken-token').expect(400);
    expect(response.body.error.code).toBe('INVALID_SHARE_LINK');
  });
});

describe('AI assistant', () => {
  it('answers with actions', async () => {
    const response = await request(app)
      .post('/api/v1/ai/chat')
      .send({ message: 'Show urban growth in Lagos', model: 'gpt-4o', temperature: 0.3, maxTokens: 500 })
      .expect(200);
    expect(response.body.message).toBeTruthy();
    expect(response.body.actions.length).toBeGreaterThan(0);
    expect(response.body.metadata.model).toBe('gpt-4o');
  });

  it('requires a non-empty message', async () => {
    const response = await request(app).post('/api/v1/ai/chat').send({ message: '   ' }).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('unknown routes', () => {
  it('returns a structured 404', async () => {
    const response = await request(app).get('/api/v1/nope').expect(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
