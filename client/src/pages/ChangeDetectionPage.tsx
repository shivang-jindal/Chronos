import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CHANGE_DETECTION_ALGORITHMS,
  CHANGE_TYPE_METADATA,
  CHANGE_TYPES,
  TEMPORAL_LAYERS,
  type ChangeDetectionResult,
  type ChangeType
} from '@chronos/shared';
import { Download, Loader2, Play, Save, SlidersHorizontal, Sparkles } from 'lucide-react';

import { useToast } from '../components/Toast';
import { workspaceApi } from '../lib/workspace';

const DEFAULT_BBOX = { west: -180, south: -60, east: 180, north: 80 };

function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function downloadGeoJson(result: ChangeDetectionResult): void {
  const collection = {
    type: 'FeatureCollection',
    properties: {
      basis: 'illustrative-deterministic-model',
      note: 'Generated from saved parameters; no satellite pixels were read and no change was validated.'
    },
    features: result.changes.map((change) => ({
      type: 'Feature',
      id: change.id,
      geometry: change.geometry,
      properties: {
        changeType: change.type,
        areaHa: change.areaHa,
        confidence: change.confidence,
        detectedAt: change.detectedAt
      }
    }))
  };
  const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `chronos-changes-${result.id.slice(0, 8)}.geojson`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ChangeDetectionPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [params, setParams] = useState({
    layer: 'landsat_annual' as (typeof TEMPORAL_LAYERS)[number],
    startDate: '2020-01-01',
    endDate: '2024-12-31',
    algorithm: 'ccdc' as (typeof CHANGE_DETECTION_ALGORITHMS)[number],
    changeTypes: [] as ChangeType[],
    confidenceThreshold: 0.6,
    minAreaHa: 0.1
  });
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<ChangeDetectionResult | null>(null);

  const toggleType = (type: ChangeType) => {
    setParams((current) => ({
      ...current,
      changeTypes: current.changeTypes.includes(type)
        ? current.changeTypes.filter((candidate) => candidate !== type)
        : [...current.changeTypes, type]
    }));
  };

  const handleSubmit = async () => {
    setRunning(true);
    try {
      const response = await fetch('/api/v1/change-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          bbox: DEFAULT_BBOX,
          changeTypes: params.changeTypes.length > 0 ? params.changeTypes : undefined,
          outputFormat: 'geojson'
        })
      });
      if (!response.ok) throw new Error('Change detection failed');
      const data = (await response.json()) as ChangeDetectionResult;
      setResults(data);
      addToast({
        type: 'success',
        title: 'Model run complete',
        message: `${data.summary.totalChanges} modeled changes across ${data.summary.totalAreaHa.toLocaleString()} ha`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Model run failed',
        message: error instanceof Error ? error.message : 'Unexpected error'
      });
    } finally {
      setRunning(false);
    }
  };

  const saveAndRun = async () => {
    setSaving(true);
    try {
      const project = await workspaceApi.createProject({
        name: `${titleCase(params.layer)} ${params.startDate.slice(0, 4)}–${params.endDate.slice(0, 4)}`,
        config: {
          ...params,
          bbox: DEFAULT_BBOX,
          changeTypes: params.changeTypes.length > 0 ? params.changeTypes : undefined,
          outputFormat: 'geojson'
        }
      });
      await workspaceApi.runProject(project.id);
      addToast({ type: 'success', title: 'Saved to the workbench', message: 'The brief is stored with its method.' });
      navigate(`/workbench?project=${project.id}`);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not save the project',
        message: error instanceof Error ? error.message : 'Unexpected error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[1400px] p-5">
        <header className="mb-5">
          <h1 className="text-2xl font-bold text-ink">Change detection</h1>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Run the illustrative model over a saved window, inspect the polygons, and keep the result as a workbench
            brief with exports and provenance.
          </p>
          <p className="mt-2 max-w-3xl rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-xs text-ink-muted">
            These polygons are generated deterministically from your parameters. No satellite pixels are read and
            nothing is validated against imagery, so treat the result as a reproducible scenario rather than measured
            change. For real satellite metadata, use <span className="text-ink">Scenes</span>.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <section className="card h-fit p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <SlidersHorizontal className="h-4 w-4 text-brand-300" aria-hidden="true" />
              Parameters
            </h2>

            <div className="mt-3 space-y-3">
              <div>
                <label className="label" htmlFor="detect-layer">
                  Layer
                </label>
                <select
                  id="detect-layer"
                  className="input"
                  value={params.layer}
                  onChange={(event) =>
                    setParams({ ...params, layer: event.target.value as (typeof TEMPORAL_LAYERS)[number] })
                  }
                >
                  {TEMPORAL_LAYERS.map((layer) => (
                    <option key={layer} value={layer}>
                      {titleCase(layer)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label" htmlFor="detect-start">
                    Start
                  </label>
                  <input
                    id="detect-start"
                    type="date"
                    className="input"
                    value={params.startDate}
                    onChange={(event) => setParams({ ...params, startDate: event.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="detect-end">
                    End
                  </label>
                  <input
                    id="detect-end"
                    type="date"
                    className="input"
                    value={params.endDate}
                    onChange={(event) => setParams({ ...params, endDate: event.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="detect-algorithm">
                  Algorithm
                </label>
                <select
                  id="detect-algorithm"
                  className="input"
                  value={params.algorithm}
                  onChange={(event) =>
                    setParams({
                      ...params,
                      algorithm: event.target.value as (typeof CHANGE_DETECTION_ALGORITHMS)[number]
                    })
                  }
                >
                  {CHANGE_DETECTION_ALGORITHMS.map((algorithm) => (
                    <option key={algorithm} value={algorithm}>
                      {algorithm.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="label">Change types</legend>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                  {CHANGE_TYPES.map((type) => (
                    <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-line accent-brand-500"
                        checked={params.changeTypes.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                      <span className="truncate">{CHANGE_TYPE_METADATA[type].label}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-ink-faint">None selected means every change type.</p>
              </fieldset>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label" htmlFor="detect-confidence">
                    Confidence ≥ {params.confidenceThreshold.toFixed(2)}
                  </label>
                  <input
                    id="detect-confidence"
                    type="range"
                    min={0}
                    max={0.95}
                    step={0.05}
                    value={params.confidenceThreshold}
                    onChange={(event) =>
                      setParams({ ...params, confidenceThreshold: Number(event.target.value) })
                    }
                    className="w-full accent-brand-500"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="detect-min-area">
                    Min area (ha)
                  </label>
                  <input
                    id="detect-min-area"
                    type="number"
                    min={0.01}
                    step={0.01}
                    className="input"
                    value={params.minAreaHa}
                    onChange={(event) =>
                      setParams({ ...params, minAreaHa: Math.max(0.01, Number(event.target.value) || 0.01) })
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={running}
                className="btn btn-primary w-full justify-center"
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                Run model
              </button>

              <button type="button" onClick={saveAndRun} disabled={saving} className="btn btn-ghost w-full justify-center">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                Save project &amp; run brief
              </button>
            </div>
          </section>

          <section className="min-w-0 space-y-5">
            {!results ? (
              <div className="card flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-ink">Configure a window, then run</h2>
                <p className="mt-2 max-w-md text-sm text-ink-muted">
                  Results appear here with modeled polygons, areas, confidence, and centroids. Save the configuration
                  to keep it, or run it as a stored brief from the workbench.
                </p>
              </div>
            ) : (
              <>
                <div className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-ink">Illustrative model result</h2>
                      <p className="mt-1 text-xs text-ink-faint">
                        {titleCase(results.layer)} · {results.startDate} → {results.endDate} ·{' '}
                        {results.algorithm.toUpperCase()} · {results.metadata.tilesProcessed} tiles ·{' '}
                        {results.metadata.processingTimeMs} ms
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn btn-ghost" onClick={() => downloadGeoJson(results)}>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        GeoJSON
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setParams({
                            layer: results.layer,
                            startDate: results.startDate,
                            endDate: results.endDate,
                            algorithm: results.algorithm,
                            changeTypes: [],
                            confidenceThreshold: results.metadata.confidenceThreshold,
                            minAreaHa: results.metadata.minAreaHa
                          });
                        }}
                      >
                        Reuse parameters
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-line bg-surface-sunken/60 p-4">
                      <p className="text-xs text-ink-faint">Changes</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-200">
                        {results.summary.totalChanges}
                      </p>
                    </div>
                    <div className="rounded-xl border border-line bg-surface-sunken/60 p-4">
                      <p className="text-xs text-ink-faint">Total area</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-200">
                        {results.summary.totalAreaHa.toLocaleString()} ha
                      </p>
                    </div>
                    <div className="rounded-xl border border-line bg-surface-sunken/60 p-4">
                      <p className="text-xs text-ink-faint">High confidence</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-200">
                        {results.summary.byConfidence.high ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="border-b border-line px-5 py-3">
                    <h3 className="text-sm font-semibold text-ink">Modeled polygons</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                          <th className="px-4 py-2 font-medium">Change type</th>
                          <th className="px-4 py-2 text-right font-medium">Area</th>
                          <th className="px-4 py-2 text-right font-medium">Confidence</th>
                          <th className="px-4 py-2 text-right font-medium">Vertices</th>
                          <th className="px-4 py-2 text-right font-medium">Model date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.changes.map((change) => (
                          <tr key={change.id} className="border-b border-line/60">
                            <td className="px-4 py-2 text-ink">{CHANGE_TYPE_METADATA[change.type].label}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-ink">
                              {change.areaHa.toLocaleString()} ha
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums text-ink">
                              {(change.confidence * 100).toFixed(0)}%
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums text-ink-muted">
                              {change.geometry.coordinates[0]?.length ?? 0}
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums text-ink-muted">
                              {change.detectedAt.slice(0, 10)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
