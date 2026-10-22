#!/usr/bin/env node
/**
 * Post-deployment smoke test. Walks the primary journeys against a running API
 * and exits non-zero on the first failure.
 *
 * Usage: node scripts/smoke.mjs [baseUrl]
 */

const baseUrl = process.argv[2] ?? process.env.SMOKE_API_URL ?? 'http://localhost:4000';

async function call(method, path, body) {
  const response = await fetch(`${baseUrl}/api/v1${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: response.status, json };
}

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ok   ${label}${detail ? ` - ${detail}` : ''}`);
  } else {
    console.error(`  FAIL ${label}${detail ? ` - ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

const health = await fetch(`${baseUrl}/health`);
const healthJson = await health.json();
check('health', health.status === 200 && healthJson.status === 'ok');

const version = await call('GET', '/version');
check('version', version.status === 200 && version.json?.name === 'Chronos');

const layers = await call('GET', '/layers');
check('layers', layers.status === 200 && Array.isArray(layers.json?.layers) && layers.json.layers.length > 0);
check('layers carry a resolution', layers.json?.layers?.every((layer) => layer.resolution === 'year' || layer.resolution === 'month'));

const change = await call('POST', '/change-detection', {
  layer: 'landsat_annual',
  startDate: '2000-01-01',
  endDate: '2024-12-31',
  algorithm: 'ccdc',
  confidenceThreshold: 0.7,
  minAreaHa: 0.5,
  outputFormat: 'geojson',
});
check('change detection', change.status === 201 && change.json?.summary?.totalChanges > 0);

const forecast = await call('POST', '/forecasting', {
  layer: 'sea_ice_annual',
  location: { type: 'point', coordinates: [0, 80] },
  horizonYears: 5,
  model: 'earthformer',
  confidenceLevel: 0.9,
  ensembleSize: 20,
  outputFormat: 'cog',
});
check('forecasting', forecast.status === 201 && forecast.json?.predictions?.length === 5);

const scenario = await call('POST', '/scenarios', {
  name: 'Smoke scenario',
  type: 'aggressive_mitigation',
  horizonYear: 2050,
  layers: ['landsat_annual'],
});
check('scenarios', scenario.status === 201 && scenario.json?.outputs?.length === 1);

const share = await call('POST', '/share-links', {
  lat: 12.5,
  lon: 77.5,
  zoom: 6,
  time: { mode: 'single', value: '2020-01-01' },
});
check('share link creation', share.status === 201 && Boolean(share.json?.token));

if (share.json?.token) {
  const decoded = await call('GET', `/share-links/${share.json.token}`);
  check('share link decoding', decoded.status === 200 && decoded.json?.payload?.lat === 12.5);
}

const chat = await call('POST', '/ai/chat', {
  message: 'Show me Amazon deforestation since 2000',
  model: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 400,
});
check('ai chat', chat.status === 200 && Boolean(chat.json?.message) && chat.json?.actions?.length > 0);

const missing = await call('GET', '/does-not-exist');
check('unknown routes return a structured 404', missing.status === 404 && missing.json?.error?.code === 'NOT_FOUND');

console.log(process.exitCode ? '\nSmoke test FAILED' : '\nSmoke test passed');
