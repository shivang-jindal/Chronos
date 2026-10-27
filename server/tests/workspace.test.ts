import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createLogger } from '../src/logger.js';

let directory: string;
let dataFile: string;

function buildApp() {
  const config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    PORT: '4100',
    SOURCE_MODE: 'embedded',
    DATA_FILE: dataFile
  } as NodeJS.ProcessEnv);
  return createApp({ config, logger: createLogger(config) });
}

const app = () => buildApp();

const projectBody = {
  name: 'Amazon frontier watch',
  config: {
    layer: 'landsat_annual',
    startDate: '2019-01-01',
    endDate: '2024-12-31',
    bbox: { west: -62, south: -6, east: -58, north: -2 },
    algorithm: 'ccdc',
    confidenceThreshold: 0.6,
    minAreaHa: 0.5,
    outputFormat: 'geojson'
  }
};

beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'chronos-workspace-'));
  dataFile = join(directory, 'workspace.json');
});

afterAll(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe('workspace', () => {
  let projectId = '';
  let runId = '';

  it('starts from an honest, offline-first state', async () => {
    const response = await request(app()).get('/api/v1/workspace').expect(200);
    expect(response.body.projects).toEqual([]);
    expect(response.body.runs).toEqual([]);
    expect(response.body.sources[0]).toMatchObject({
      id: 'nasa-eonet',
      mode: 'embedded',
      configuredMode: 'embedded',
      recordCount: 7
    });
    expect(response.body.sources[0].note).toContain('SOURCE_MODE=live');
  });

  it('saves a named project', async () => {
    const response = await request(app()).post('/api/v1/projects').send(projectBody).expect(201);
    expect(response.body.name).toBe('Amazon frontier watch');
    expect(response.body.kind).toBe('chronos');
    expect(response.body.runCount).toBe(0);
    projectId = response.body.id;
  });

  it('runs the project into a stored change brief', async () => {
    const response = await request(app())
      .post(`/api/v1/projects/${projectId}/runs`)
      .send({ note: 'First pass' })
      .expect(201);

    const { run } = response.body;
    expect(run.projectId).toBe(projectId);
    expect(run.note).toBe('First pass');
    expect(run.source).toBe('embedded');
    expect(run.output.totalChanges).toBeGreaterThan(0);
    expect(run.output.events.length).toBeGreaterThan(0);
    expect(run.output.headline).toContain('% high confidence');
    expect(response.body.project.runCount).toBe(1);
    runId = run.id;
  });

  it('survives a new app instance reading the same file', async () => {
    const response = await request(app()).get('/api/v1/workspace').expect(200);
    expect(response.body.projects).toHaveLength(1);
    expect(response.body.projects[0].runCount).toBe(1);
    expect(response.body.runs).toHaveLength(1);
    expect(response.body.runs[0].id).toBe(runId);
  });

  it('exports the stored run as CSV and JSON', async () => {
    const csv = await request(app()).get(`/api/v1/projects/${projectId}/export?format=csv`).expect(200);
    expect(csv.headers['content-type']).toContain('text/csv');
    expect(csv.text).toContain('event_id,change_type,area_ha,confidence');
    expect(csv.text).toContain('Amazon frontier watch');

    const json = await request(app()).get(`/api/v1/projects/${projectId}/export?format=json`).expect(200);
    expect(json.body.format).toBe('chronos-brief/1');
    expect(json.body.output.events.length).toBeGreaterThan(0);
    expect(json.body.project).toBe('Amazon frontier watch');
  });

  it('renders a printable brief', async () => {
    const response = await request(app()).get(`/api/v1/projects/${projectId}/brief`).expect(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('Amazon frontier watch');
    expect(response.text).toContain('Chronos change brief');
    expect(response.text).toContain('Method and provenance');
    expect(response.text).not.toContain('<script');
  });

  it('exchanges a league envelope and imports it back', async () => {
    const envelope = await request(app()).get(`/api/v1/projects/${projectId}/envelope`).expect(200);
    expect(envelope.body).toMatchObject({ format: 'gods-eye/1', kind: 'chronos' });

    const imported = await request(app())
      .post('/api/v1/league/import')
      .send(envelope.body)
      .expect(201);
    expect(imported.body.matched).toBe('native');
    expect(imported.body.project.config.bbox).toEqual(projectBody.config.bbox);
  });

  it('narrows a sibling envelope to the area of interest it carries', async () => {
    const imported = await request(app())
      .post('/api/v1/league/import')
      .send({
        format: 'gods-eye/1',
        kind: 'biosphere',
        name: 'Atlantic forest corridor',
        createdAt: new Date().toISOString(),
        payload: {
          app: 'BioSphere',
          version: '1.1.0',
          config: { region: 'latin america' },
          hint: { label: 'Atlantic forest corridor', bbox: { west: -45, south: -25, east: -38, north: -18 } }
        }
      })
      .expect(201);

    expect(imported.body.matched).toBe('hint');
    expect(imported.body.project.config.bbox).toEqual({ west: -45, south: -25, east: -38, north: -18 });
  });

  it('refuses to export a project that has never run', async () => {
    const created = await request(app())
      .post('/api/v1/projects')
      .send({ ...projectBody, name: 'No runs yet' })
      .expect(201);

    const response = await request(app()).get(`/api/v1/projects/${created.body.id}/export`).expect(409);
    expect(response.body.error.code).toBe('NO_RUN');
  });

  it('returns structured 404s for unknown work', async () => {
    await request(app()).get('/api/v1/projects/nope').expect(404);
    await request(app()).get('/api/v1/runs/nope').expect(404);
  });

  it('deletes a project together with its runs', async () => {
    await request(app()).delete(`/api/v1/projects/${projectId}`).expect(204);
    await request(app()).get(`/api/v1/runs/${runId}`).expect(404);
    const response = await request(app()).get('/api/v1/workspace').expect(200);
    expect(response.body.projects.map((project: { name: string }) => project.name)).not.toContain(
      'Amazon frontier watch'
    );
  });
});
