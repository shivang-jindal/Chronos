import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Clock,
  Database,
  Download,
  FileJson,
  FileText,
  Loader2,
  MapPin,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Upload
} from 'lucide-react';

import {
  CHANGE_DETECTION_ALGORITHMS,
  TEMPORAL_LAYERS,
  type LeagueEnvelope,
  type WorkspaceProject
} from '@chronos/shared';

import { useToast } from '../components/Toast';
import { briefUrl, downloadJson, exportUrl, workspaceApi } from '../lib/workspace';

const AREAS = {
  amazon: { label: 'Amazon basin', bbox: { west: -73, south: -16, east: -45, north: 5 } },
  sahel: { label: 'Sahel', bbox: { west: -17, south: 4, east: 45, north: 20 } },
  southeast_asia: { label: 'Southeast Asia', bbox: { west: 95, south: -11, east: 141, north: 23 } },
  europe: { label: 'Western Europe', bbox: { west: -10, south: 36, east: 20, north: 60 } },
  california: { label: 'California', bbox: { west: -124, south: 32, east: -114, north: 42 } },
  global: { label: 'Global sample', bbox: { west: -180, south: -60, east: 180, north: 80 } }
} as const;

type AreaKey = keyof typeof AREAS;

function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value: string | null): string {
  if (!value) return 'never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function modeTone(mode: string): string {
  if (mode === 'live') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  if (mode === 'cache') return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
  return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
}

export function WorkbenchPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const snapshot = useQuery({ queryKey: ['workspace'], queryFn: workspaceApi.snapshot });
  const projects = snapshot.data?.projects ?? [];
  const selectedId = searchParams.get('project') ?? projects[0]?.id ?? null;
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0] ?? null;
  const runs = useMemo(
    () => (snapshot.data?.runs ?? []).filter((run) => run.projectId === selected?.id),
    [snapshot.data, selected?.id]
  );
  const latestRun = runs[0] ?? null;

  const [name, setName] = useState('Amazon frontier watch');
  const [area, setArea] = useState<AreaKey>('amazon');
  const [layer, setLayer] = useState('landsat_annual');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [algorithm, setAlgorithm] = useState('ccdc');
  const [threshold, setThreshold] = useState(0.6);
  const [minArea, setMinArea] = useState(0.5);
  const [note, setNote] = useState('');

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['workspace'] });

  const createProject = useMutation({
    mutationFn: workspaceApi.createProject,
    onSuccess: async (project) => {
      await invalidate();
      setSearchParams({ project: project.id });
      setName('');
      addToast({ type: 'success', title: 'Project saved', message: project.name });
    },
    onError: (error) => addToast({ type: 'error', title: 'Could not save project', message: error.message })
  });

  const runProject = useMutation({
    mutationFn: ({ id, note: runNote }: { id: string; note?: string }) =>
      workspaceApi.runProject(id, runNote),
    onSuccess: async ({ run }) => {
      await invalidate();
      setNote('');
      addToast({ type: 'success', title: 'Brief generated', message: run.summary });
    },
    onError: (error) => addToast({ type: 'error', title: 'Run failed', message: error.message })
  });

  const removeProject = useMutation({
    mutationFn: workspaceApi.deleteProject,
    onSuccess: async () => {
      await invalidate();
      setSearchParams({});
      addToast({ type: 'success', title: 'Project deleted' });
    },
    onError: (error) => addToast({ type: 'error', title: 'Could not delete project', message: error.message })
  });

  const refreshSources = useMutation({
    mutationFn: workspaceApi.refreshSources,
    onSuccess: async ({ sources }) => {
      await invalidate();
      const source = sources[0];
      addToast({
        type: source?.mode === 'live' ? 'success' : 'info',
        title: source?.mode === 'live' ? 'Live data refreshed' : 'Still on the embedded snapshot',
        message: source?.note ?? undefined
      });
    },
    onError: (error) => addToast({ type: 'error', title: 'Refresh failed', message: error.message })
  });

  const importEnvelope = useMutation({
    mutationFn: workspaceApi.importEnvelope,
    onSuccess: async ({ project, matched }) => {
      await invalidate();
      setSearchParams({ project: project.id });
      addToast({
        type: 'success',
        title: 'Envelope imported',
        message:
          matched === 'native'
            ? `${project.name} restored with its exact Chronos configuration.`
            : `${project.name} placed using the area of interest carried by the envelope.`
      });
    },
    onError: (error) => addToast({ type: 'error', title: 'Import rejected', message: error.message })
  });

  const source = snapshot.data?.sources[0];

  const submitProject = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      addToast({ type: 'warning', title: 'Give the project a name' });
      return;
    }
    createProject.mutate({
      name: name.trim(),
      config: {
        layer: layer as (typeof TEMPORAL_LAYERS)[number],
        startDate,
        endDate,
        bbox: AREAS[area].bbox,
        algorithm: algorithm as (typeof CHANGE_DETECTION_ALGORITHMS)[number],
        confidenceThreshold: threshold,
        minAreaHa: minArea,
        outputFormat: 'geojson'
      }
    });
  };

  const handleEnvelopeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as LeagueEnvelope;
      importEnvelope.mutate(parsed);
    } catch {
      addToast({ type: 'error', title: 'That file is not a JSON envelope' });
    }
  };

  const saveEnvelope = async (project: WorkspaceProject) => {
    try {
      const envelope = await workspaceApi.envelope(project.id);
      downloadJson(`${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.gods-eye.json`, envelope);
      addToast({ type: 'success', title: 'Envelope exported', message: 'Drop it into any Gods-Eye app to continue there.' });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not export envelope',
        message: error instanceof Error ? error.message : 'Unexpected error'
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[1400px] space-y-5 p-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              Chronos workbench
            </div>
            <h1 className="mt-1 text-2xl font-bold text-ink">Saved change briefs you can hand on</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              Every project is a named area and time window. Run it to produce a stored brief with method and
              provenance, then export CSV, JSON, or a printable page that a colleague can read without the app.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {source && (
              <span className={`chip border ${modeTone(source.mode)}`}>
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                {source.label} · {source.recordCount} records · {source.mode}
              </span>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => refreshSources.mutate()}
              disabled={refreshSources.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${refreshSources.isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh feed
            </button>
            <label className="btn btn-ghost cursor-pointer">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import envelope
              <input type="file" accept="application/json,.json" className="sr-only" onChange={handleEnvelopeFile} />
            </label>
          </div>
        </header>

        {source?.note && (
          <p className="rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-xs text-ink-muted">
            {source.note}
            {source.fetchedAt ? ` Last successful fetch: ${formatDate(source.fetchedAt)}.` : ''}
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <form className="card p-4" onSubmit={submitProject}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Plus className="h-4 w-4 text-brand-300" aria-hidden="true" />
                New project
              </h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="label" htmlFor="project-name">
                    Name
                  </label>
                  <input
                    id="project-name"
                    className="input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Amazon frontier watch"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="project-area">
                    Area of interest
                  </label>
                  <select
                    id="project-area"
                    className="input"
                    value={area}
                    onChange={(event) => setArea(event.target.value as AreaKey)}
                  >
                    {Object.entries(AREAS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="project-layer">
                    Imagery layer
                  </label>
                  <select
                    id="project-layer"
                    className="input"
                    value={layer}
                    onChange={(event) => setLayer(event.target.value)}
                  >
                    {TEMPORAL_LAYERS.map((value) => (
                      <option key={value} value={value}>
                        {titleCase(value)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label" htmlFor="project-start">
                      Start
                    </label>
                    <input
                      id="project-start"
                      type="date"
                      className="input"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="project-end">
                      End
                    </label>
                    <input
                      id="project-end"
                      type="date"
                      className="input"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="project-algorithm">
                    Detector
                  </label>
                  <select
                    id="project-algorithm"
                    className="input"
                    value={algorithm}
                    onChange={(event) => setAlgorithm(event.target.value)}
                  >
                    {CHANGE_DETECTION_ALGORITHMS.map((value) => (
                      <option key={value} value={value}>
                        {value.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label" htmlFor="project-threshold">
                      Confidence ≥ {threshold.toFixed(2)}
                    </label>
                    <input
                      id="project-threshold"
                      type="range"
                      min={0}
                      max={0.95}
                      step={0.05}
                      value={threshold}
                      onChange={(event) => setThreshold(Number(event.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="project-min-area">
                      Min area (ha)
                    </label>
                    <input
                      id="project-min-area"
                      type="number"
                      min={0.01}
                      step={0.01}
                      className="input"
                      value={minArea}
                      onChange={(event) => setMinArea(Math.max(0.01, Number(event.target.value) || 0.01))}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full justify-center" disabled={createProject.isPending}>
                  {createProject.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  )}
                  Save project
                </button>
              </div>
            </form>

            <section className="card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">Saved projects</h2>
                <span className="text-xs text-ink-faint">{projects.length}</span>
              </div>

              {snapshot.isLoading ? (
                <p className="mt-3 text-sm text-ink-muted">Loading workspace…</p>
              ) : projects.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">
                  Nothing saved yet. The form above creates the first project; nothing leaves this machine.
                </p>
              ) : (
                <ul className="mt-3 space-y-1.5">
                  {projects.map((project) => {
                    const active = project.id === selected?.id;
                    return (
                      <li key={project.id}>
                        <button
                          type="button"
                          onClick={() => setSearchParams({ project: project.id })}
                          className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                            active
                              ? 'border-brand-500/40 bg-brand-500/10'
                              : 'border-transparent hover:border-line hover:bg-white/5'
                          }`}
                        >
                          <span className="block truncate text-sm font-medium text-ink">{project.name}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-faint">
                            <span>{titleCase(project.config.layer)}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {project.config.startDate.slice(0, 4)}–{project.config.endDate.slice(0, 4)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {project.runCount} run{project.runCount === 1 ? '' : 's'}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </aside>

          <section className="min-w-0 space-y-5">
            {!selected ? (
              <div className="card flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                  <MapPin className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-ink">A brief starts with a place and a window</h2>
                <p className="mt-2 max-w-md text-sm text-ink-muted">
                  Create a project, run it, and Chronos stores the result with its method, confidence split, and the
                  live natural events that overlap the area. The exports stay useful after the tab closes.
                </p>
              </div>
            ) : (
              <>
                <div className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-ink">{selected.name}</h2>
                      <p className="mt-1 text-xs text-ink-faint">
                        Saved {formatDate(selected.createdAt)} · last run {formatDate(selected.lastRunAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => runProject.mutate({ id: selected.id, note: note.trim() || undefined })}
                        disabled={runProject.isPending}
                      >
                        {runProject.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Play className="h-4 w-4" aria-hidden="true" />
                        )}
                        Run brief
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost text-red-300"
                        onClick={() => {
                          if (window.confirm(`Delete “${selected.name}” and its run history?`)) {
                            removeProject.mutate(selected.id);
                          }
                        }}
                        disabled={removeProject.isPending}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ['Layer', titleCase(selected.config.layer)],
                      ['Window', `${selected.config.startDate} → ${selected.config.endDate}`],
                      ['Detector', selected.config.algorithm.toUpperCase()],
                      ['Threshold', `${selected.config.confidenceThreshold} confidence · ${selected.config.minAreaHa} ha min`]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-line bg-surface-sunken/60 px-3 py-2">
                        <dt className="text-xs text-ink-faint">{label}</dt>
                        <dd className="mt-0.5 text-sm text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      className="input max-w-sm flex-1"
                      placeholder="Run note (optional) — e.g. post-fire review"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      maxLength={280}
                    />
                    <a
                      className={`btn btn-ghost ${latestRun ? '' : 'pointer-events-none opacity-40'}`}
                      href={latestRun ? exportUrl(selected.id, 'csv') : undefined}
                      download
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      CSV
                    </a>
                    <a
                      className={`btn btn-ghost ${latestRun ? '' : 'pointer-events-none opacity-40'}`}
                      href={latestRun ? exportUrl(selected.id, 'json') : undefined}
                      download
                    >
                      <FileJson className="h-4 w-4" aria-hidden="true" />
                      JSON
                    </a>
                    <a
                      className={`btn btn-ghost ${latestRun ? '' : 'pointer-events-none opacity-40'}`}
                      href={latestRun ? briefUrl(selected.id) : undefined}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Printable brief
                    </a>
                    <button type="button" className="btn btn-ghost" onClick={() => saveEnvelope(selected)}>
                      <Briefcase className="h-4 w-4" aria-hidden="true" />
                      Envelope
                    </button>
                  </div>
                </div>

                {latestRun ? (
                  <article className="card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
                          Latest brief
                        </h3>
                        <p className="mt-1 max-w-3xl text-base font-medium text-ink">{latestRun.output.headline}</p>
                      </div>
                      <span className="chip border border-line text-ink-muted">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDate(latestRun.createdAt)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        ['Changes detected', latestRun.output.totalChanges.toLocaleString()],
                        ['Total area', `${latestRun.output.totalAreaHa.toLocaleString()} ha`],
                        [
                          'High confidence',
                          `${latestRun.output.confidence.high} of ${latestRun.output.totalChanges}`
                        ]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-line bg-surface-sunken/60 p-4">
                          <p className="text-xs text-ink-faint">{label}</p>
                          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-200">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold text-ink">Area by change type</h4>
                        <table className="mt-2 w-full text-sm">
                          <thead>
                            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                              <th className="py-2 font-medium">Type</th>
                              <th className="py-2 text-right font-medium">Count</th>
                              <th className="py-2 text-right font-medium">Area</th>
                            </tr>
                          </thead>
                          <tbody>
                            {latestRun.output.byType.map((row) => (
                              <tr key={row.type} className="border-b border-line/60">
                                <td className="py-2 capitalize text-ink-muted">{row.type.replace(/_/g, ' ')}</td>
                                <td className="py-2 text-right tabular-nums text-ink">{row.count}</td>
                                <td className="py-2 text-right tabular-nums text-ink">
                                  {row.areaHa.toLocaleString()} ha
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-ink">Largest events</h4>
                        <table className="mt-2 w-full text-sm">
                          <thead>
                            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                              <th className="py-2 font-medium">Type</th>
                              <th className="py-2 text-right font-medium">Area</th>
                              <th className="py-2 text-right font-medium">Confidence</th>
                              <th className="py-2 text-right font-medium">Centroid</th>
                            </tr>
                          </thead>
                          <tbody>
                            {latestRun.output.events.map((event) => (
                              <tr key={event.id} className="border-b border-line/60">
                                <td className="py-2 capitalize text-ink-muted">{event.type.replace(/_/g, ' ')}</td>
                                <td className="py-2 text-right tabular-nums text-ink">
                                  {event.areaHa.toLocaleString()} ha
                                </td>
                                <td className="py-2 text-right tabular-nums text-ink">
                                  {(event.confidence * 100).toFixed(0)}%
                                </td>
                                <td className="py-2 text-right tabular-nums text-ink-muted">
                                  {event.centroid.lat.toFixed(2)}, {event.centroid.lon.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <p className="mt-4 border-t border-line pt-3 text-xs text-ink-faint">
                      Source: {latestRun.output.source.label} ({latestRun.output.source.mode}).{' '}
                      {latestRun.output.source.note ?? 'Live feed.'} Generated {formatDate(latestRun.createdAt)} in{' '}
                      {latestRun.durationMs} ms.
                    </p>
                  </article>
                ) : (
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold text-ink">No brief yet</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      Run this project to produce the first stored brief. Exports and the printable page unlock as soon
                      as a run exists.
                    </p>
                  </div>
                )}

                <section className="card p-5">
                  <h3 className="text-sm font-semibold text-ink">Run history</h3>
                  {runs.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-muted">Runs are kept for this project, newest first.</p>
                  ) : (
                    <ol className="mt-3 space-y-2">
                      {runs.map((run) => (
                        <li
                          key={run.id}
                          className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-line bg-surface-sunken/40 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-ink">{run.summary}</p>
                            <p className="mt-0.5 text-xs text-ink-faint">
                              {formatDate(run.createdAt)} · {run.durationMs} ms · {run.source}
                              {run.note ? ` · ${run.note}` : ''}
                            </p>
                          </div>
                          <span className="text-xs tabular-nums text-ink-faint">
                            {run.output.totalChanges} changes
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
