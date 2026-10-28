import { Router } from 'express';
import { z } from 'zod';

import {
  APP_KIND,
  changeBriefRunSchema,
  configFromEnvelope,
  leagueEnvelopeSchema,
  projectInputSchema,
  projectPatchSchema,
  runInputSchema,
  toEnvelope,
  workspaceProjectSchema,
  workspaceSnapshotSchema,
  type ChangeBriefResult,
  type ChangeBriefRun,
  type ProjectConfig,
  type SourceStatus
} from '@chronos/shared';

import { asyncHandler, validateBody } from './middleware.js';
import { buildChangeBrief } from '../domain/workbench.js';
import type { SourceRegistry } from '../providers/sources.js';
import type { WorkspaceStore } from '../store/workspaceStore.js';

export interface WorkspaceDependencies {
  store: WorkspaceStore<ProjectConfig, ChangeBriefResult>;
  registry: SourceRegistry;
}

const exportQuerySchema = z.object({
  format: z.enum(['csv', 'json']).default('json')
});

type ApiFailure = Error & { statusCode?: number; code?: string };

function failure(message: string, statusCode = 400, code = 'REQUEST_ERROR'): ApiFailure {
  const error = new Error(message) as ApiFailure;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sourceStatus(registry: SourceRegistry): SourceStatus {
  const snapshot = registry.status();
  return {
    id: snapshot.id,
    label: snapshot.label,
    url: snapshot.url,
    mode: snapshot.mode,
    fetchedAt: snapshot.fetchedAt,
    recordCount: snapshot.events.length,
    note: snapshot.note,
    configuredMode: registry.configuredMode
  };
}

function csvFor(run: ChangeBriefRun, projectName: string): string {
  const rows: string[] = [
    `project,${JSON.stringify(projectName)}`,
    `generated_at,${run.output.generatedAt}`,
    'output_basis,illustrative deterministic model (not pixel-derived, not validated)',
    `cross_check_feed,${JSON.stringify(run.output.source.label)}`,
    `cross_check_mode,${run.output.source.mode}`,
    `headline,${JSON.stringify(run.output.headline)}`,
    '',
    'event_id,change_type,area_ha,confidence,centroid_lat,centroid_lon'
  ];
  for (const event of run.output.events) {
    rows.push(
      [
        event.id,
        event.type,
        event.areaHa,
        event.confidence,
        event.centroid.lat,
        event.centroid.lon
      ].join(',')
    );
  }
  rows.push('', 'change_type,count,area_ha');
  for (const row of run.output.byType) {
    rows.push([row.type, row.count, row.areaHa].join(','));
  }
  return `${rows.join('\n')}\n`;
}

/**
 * A printable brief: the artifact that leaves the app.
 *
 * Deliberately self-contained (inline CSS, no scripts) so it can be printed to
 * PDF or attached to an email without any of the app's assets.
 */
function briefHtml(projectName: string, run: ChangeBriefRun): string {
  const typeRows = run.output.byType
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.type.replace(/_/g, ' '))}</td><td class="num">${row.count}</td><td class="num">${row.areaHa.toLocaleString('en-US')} ha</td></tr>`
    )
    .join('');

  const eventRows = run.output.events
    .map(
      (event) =>
        `<tr><td>${escapeHtml(event.type.replace(/_/g, ' '))}</td><td class="num">${event.areaHa.toLocaleString('en-US')} ha</td><td class="num">${(event.confidence * 100).toFixed(0)}%</td><td class="num">${event.centroid.lat.toFixed(2)}, ${event.centroid.lon.toFixed(2)}</td></tr>`
    )
    .join('');

  const sourceLine = run.output.source.fetchedAt
    ? `${escapeHtml(run.output.source.label)} (live, fetched ${escapeHtml(run.output.source.fetchedAt)})`
    : `${escapeHtml(run.output.source.label)} (embedded reference snapshot)`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(projectName)} — change brief</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 48px; font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: #101828; background: #fff; }
  main { max-width: 760px; margin: 0 auto; }
  .eyebrow { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #5b6b7f; margin: 0 0 8px; }
  h1 { font-size: 27px; line-height: 1.25; margin: 0 0 10px; }
  .lede { font-size: 16px; color: #344054; margin: 0 0 28px; }
  h2 { font-size: 15px; letter-spacing: .04em; text-transform: uppercase; color: #475467; margin: 32px 0 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e4e7ec; }
  th { font-weight: 600; color: #475467; background: #f9fafb; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
  .stat { border: 1px solid #e4e7ec; border-radius: 10px; padding: 14px 16px; }
  .stat dt { font-size: 12px; color: #667085; margin: 0 0 4px; }
  .stat dd { margin: 0; font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums; }
  footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e4e7ec; font-size: 12px; color: #667085; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<main>
  <p class="eyebrow">Chronos change brief</p>
  <h1>${escapeHtml(projectName)}</h1>
  <p class="lede">${escapeHtml(run.output.headline)}</p>

  <dl class="stats">
    <div class="stat"><dt>Changes</dt><dd>${run.output.totalChanges}</dd></div>
    <div class="stat"><dt>Total area</dt><dd>${run.output.totalAreaHa.toLocaleString('en-US')} ha</dd></div>
    <div class="stat"><dt>High confidence</dt><dd>${run.output.confidence.high}</dd></div>
  </dl>

  <h2>Area by change type</h2>
  <table>
    <thead><tr><th>Change type</th><th class="num">Count</th><th class="num">Area</th></tr></thead>
    <tbody>${typeRows || '<tr><td colspan="3">No changes in this window.</td></tr>'}</tbody>
  </table>

  <h2>Largest events</h2>
  <table>
    <thead><tr><th>Change type</th><th class="num">Area</th><th class="num">Confidence</th><th class="num">Centroid</th></tr></thead>
    <tbody>${eventRows || '<tr><td colspan="4">No events above the threshold.</td></tr>'}</tbody>
  </table>

  <h2>Method and provenance</h2>
  <p><strong>These figures are modeled, not measured.</strong> Chronos generated them with a deterministic
  illustrative model seeded by the saved project configuration. Re-running the project reproduces the same
  counts and areas, but no satellite pixels were read and no change was validated against imagery.</p>
  <p>The natural-event feed is used only as a cross-check for open events overlapping the area of interest:
  ${sourceLine}${run.output.source.note ? `. ${escapeHtml(run.output.source.note)}` : ''}.</p>

  <footer>
    Generated ${escapeHtml(run.output.generatedAt)} by Chronos ${escapeHtml(APP_KIND)} workspace ·
    run ${escapeHtml(run.id)}
  </footer>
</main>
</body>
</html>
`;
}

export function createWorkspaceRouter({ store, registry }: WorkspaceDependencies): Router {
  const router = Router();

  router.get(
    '/v1/workspace',
    asyncHandler(async (_req, res) => {
      const [projects, runs] = await Promise.all([store.listProjects(), store.listRuns()]);
      res.json(
        workspaceSnapshotSchema.parse({
          projects,
          runs,
          sources: [sourceStatus(registry)]
        })
      );
    })
  );

  router.get('/v1/sources', (_req, res) => {
    res.json({ sources: [sourceStatus(registry)] });
  });

  router.post(
    '/v1/sources/refresh',
    asyncHandler(async (_req, res) => {
      await registry.refresh();
      res.json({ sources: [sourceStatus(registry)] });
    })
  );

  router.get(
    '/v1/projects',
    asyncHandler(async (_req, res) => {
      res.json({ projects: await store.listProjects() });
    })
  );

  router.post(
    '/v1/projects',
    validateBody(projectInputSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof projectInputSchema>;
      const project = await store.createProject(APP_KIND, body.name, body.config);
      res.status(201).json(project);
    })
  );

  router.get(
    '/v1/projects/:id',
    asyncHandler(async (req, res) => {
      const project = await store.getProject(req.params.id ?? '');
      if (!project) throw failure('Project not found', 404, 'NOT_FOUND');
      res.json(project);
    })
  );

  router.patch(
    '/v1/projects/:id',
    validateBody(projectPatchSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof projectPatchSchema>;
      const project = await store.updateProject(req.params.id ?? '', body);
      if (!project) throw failure('Project not found', 404, 'NOT_FOUND');
      res.json(project);
    })
  );

  router.delete(
    '/v1/projects/:id',
    asyncHandler(async (req, res) => {
      const removed = await store.deleteProject(req.params.id ?? '');
      if (!removed) throw failure('Project not found', 404, 'NOT_FOUND');
      res.status(204).end();
    })
  );

  router.get(
    '/v1/projects/:id/runs',
    asyncHandler(async (req, res) => {
      const project = await store.getProject(req.params.id ?? '');
      if (!project) throw failure('Project not found', 404, 'NOT_FOUND');
      res.json({ runs: await store.listRuns(project.id) });
    })
  );

  router.post(
    '/v1/projects/:id/runs',
    validateBody(runInputSchema),
    asyncHandler(async (req, res) => {
      const project = await store.getProject(req.params.id ?? '');
      if (!project) throw failure('Project not found', 404, 'NOT_FOUND');

      const body = req.body as z.infer<typeof runInputSchema>;
      const startedAt = Date.now();
      const source = await registry.current();
      const brief = buildChangeBrief(project.config, source);

      const run = await store.addRun({
        projectId: project.id,
        kind: APP_KIND,
        createdAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        provider: brief.provider,
        source: source.mode,
        summary: brief.summary,
        note: body.note ?? null,
        output: brief.output
      });

      res.status(201).json({ run: changeBriefRunSchema.parse(run), project: await store.getProject(project.id) });
    })
  );

  router.get(
    '/v1/runs/:id',
    asyncHandler(async (req, res) => {
      const run = await store.getRun(req.params.id ?? '');
      if (!run) throw failure('Run not found', 404, 'NOT_FOUND');
      res.json(run);
    })
  );

  /** Latest stored run for a project, or a clear 409 when there is nothing to export. */
  async function latestRun(projectId: string): Promise<{ projectName: string; run: ChangeBriefRun }> {
    const project = await store.getProject(projectId);
    if (!project) throw failure('Project not found', 404, 'NOT_FOUND');
    const [run] = await store.listRuns(projectId);
    if (!run) throw failure('Run the project once before exporting', 409, 'NO_RUN');
    return { projectName: project.name, run: changeBriefRunSchema.parse(run) };
  }

  router.get(
    '/v1/projects/:id/export',
    asyncHandler(async (req, res) => {
      const query = exportQuerySchema.safeParse(req.query);
      if (!query.success) throw failure('Unsupported export format', 400, 'VALIDATION_ERROR');

      const { projectName, run } = await latestRun(req.params.id ?? '');
      const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'chronos-brief';

      if (query.data.format === 'csv') {
        res.type('text/csv; charset=utf-8');
        res.setHeader('content-disposition', `attachment; filename="${slug}-changes.csv"`);
        res.send(csvFor(run, projectName));
        return;
      }

      res.type('application/json; charset=utf-8');
      res.setHeader('content-disposition', `attachment; filename="${slug}-changes.json"`);
      res.send(
        JSON.stringify(
          {
            format: 'chronos-brief/1',
            outputBasis: 'illustrative-deterministic-model',
            project: projectName,
            run: run.id,
            generatedAt: run.output.generatedAt,
            output: run.output
          },
          null,
          2
        )
      );
    })
  );

  router.get(
    '/v1/projects/:id/brief',
    asyncHandler(async (req, res) => {
      const { projectName, run } = await latestRun(req.params.id ?? '');
      res.type('text/html; charset=utf-8');
      res.send(briefHtml(projectName, run));
    })
  );

  router.get(
    '/v1/projects/:id/envelope',
    asyncHandler(async (req, res) => {
      const project = await store.getProject(req.params.id ?? '');
      if (!project) throw failure('Project not found', 404, 'NOT_FOUND');
      res.json(toEnvelope(workspaceProjectSchema.parse(project)));
    })
  );

  /**
   * Accept a project from any other app in the league. A native Chronos
   * payload round-trips exactly; a sibling envelope is narrowed to the area of
   * interest it carries, so a scenario built elsewhere still becomes a usable
   * Chronos project.
   */
  router.post(
    '/v1/league/import',
    validateBody(leagueEnvelopeSchema),
    asyncHandler(async (req, res) => {
      const envelope = req.body as z.infer<typeof leagueEnvelopeSchema>;
      const imported = configFromEnvelope(envelope);
      if (!imported) {
        throw failure(
          'Envelope carries neither a Chronos configuration nor a usable spatial hint',
          422,
          'UNSUPPORTED_ENVELOPE'
        );
      }

      const project = await store.createProject(
        APP_KIND,
        `${envelope.name} (from ${envelope.kind})`,
        imported.config
      );
      res.status(201).json({ project, matched: imported.matched });
    })
  );

  return router;
}
