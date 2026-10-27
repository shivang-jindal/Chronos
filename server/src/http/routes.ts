import { Router } from 'express';
import { z } from 'zod';
import {
  aiChatRequestSchema,
  changeDetectionRequestSchema,
  forecastingRequestSchema,
  scenarioRequestSchema,
  shareLinkPayloadSchema,
  TEMPORAL_LAYERS,
  TEMPORAL_RESOLUTIONS,
  VISUALIZATION_STYLES,
  EXPORT_FORMATS,
  CHANGE_TYPES,
  FORECASTING_MODELS,
  SCENARIO_TYPES
} from '@chronos/shared';

import { asyncHandler, validateBody } from './middleware.js';
import {
  decodeShareLink,
  detectChanges,
  encodeShareLink,
  evaluateScenario,
  forecast,
  respondToChat
} from '../domain/engine.js';
import { searchScenes } from '../providers/stac.js';

export const apiRouter = Router();

apiRouter.get('/v1/version', (_req, res) => {
  res.json({ name: 'Chronos', version: '1.0.0', apiVersion: 'v1' });
});

apiRouter.get('/v1/capabilities', (_req, res) => {
  res.json({
    temporalLayers: TEMPORAL_LAYERS,
    resolutions: TEMPORAL_RESOLUTIONS,
    visualizationStyles: VISUALIZATION_STYLES,
    exportFormats: EXPORT_FORMATS,
    changeTypes: CHANGE_TYPES,
    forecastingModels: FORECASTING_MODELS,
    scenarioTypes: SCENARIO_TYPES
  });
});

apiRouter.get('/v1/layers', (_req, res) => {
  res.json({
    layers: TEMPORAL_LAYERS.map((id) => ({
      id,
      label: id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      resolution: id.endsWith('_monthly') ? 'month' : 'year'
    }))
  });
});

const sceneSearchInput = z.object({ collection: z.enum(['landsat-c2-l2', 'sentinel-2-l2a']), bbox: z.array(z.number()).length(4), datetime: z.string().regex(/^\d{4}-\d{2}-\d{2}T00:00:00Z\/\d{4}-\d{2}-\d{2}T23:59:59Z$/), limit: z.number().int().min(1).max(20).default(10) }).refine((value) => value.bbox[0]! < value.bbox[2]! && value.bbox[1]! < value.bbox[3]! && value.bbox[0]! >= -180 && value.bbox[2]! <= 180 && value.bbox[1]! >= -90 && value.bbox[3]! <= 90, 'Bounding box must be ordered and within longitude/latitude limits.');
apiRouter.post('/v1/scenes/search', validateBody(sceneSearchInput), asyncHandler(async (req, res) => {
  res.status(201).json(await searchScenes(req.body));
}));

apiRouter.post(
  '/v1/change-detection',
  validateBody(changeDetectionRequestSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(detectChanges(req.body));
  })
);

apiRouter.post(
  '/v1/forecasting',
  validateBody(forecastingRequestSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(forecast(req.body));
  })
);

apiRouter.post(
  '/v1/scenarios',
  validateBody(scenarioRequestSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(evaluateScenario(req.body));
  })
);

apiRouter.post(
  '/v1/ai/chat',
  validateBody(aiChatRequestSchema),
  asyncHandler(async (req, res) => {
    res.json(respondToChat(req.body));
  })
);

apiRouter.post(
  '/v1/share-links',
  validateBody(shareLinkPayloadSchema),
  asyncHandler(async (req, res) => {
    const token = encodeShareLink(req.body);
    res.status(201).json({ token, path: `/?share=${token}` });
  })
);

apiRouter.get('/v1/share-links/:token', (req, res, next) => {
  try {
    res.json({ payload: decodeShareLink(req.params.token ?? '') });
  } catch {
    const error = new Error('Share link is not valid') as Error & { statusCode: number; code: string };
    error.statusCode = 400;
    error.code = 'INVALID_SHARE_LINK';
    next(error);
  }
});
