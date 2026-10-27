import { useChronosStore } from '../store/chronosStore';
import { VISUALIZATION_STYLES, TEMPORAL_RESOLUTIONS } from '@chronos/shared';

export function SettingsPage() {
  const { visualizationStyle, setVisualizationStyle, temporal, setResolution } = useChronosStore();

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface-sunken">
      <h1 className="text-2xl font-bold text-ink">Settings</h1>
      <p className="mt-1 text-ink-muted">Tune how Chronos renders and animates time.</p>

      <section className="mt-8 max-w-2xl space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">Visualisation</h2>
        <div className="rounded-xl border border-line p-4 border-line">
          <label htmlFor="visualization-style" className="block text-sm font-medium text-ink-muted">
            Default visualization style
          </label>
          <select
            id="visualization-style"
            value={visualizationStyle}
            onChange={(e) => setVisualizationStyle(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border-line bg-surface-raised"
          >
            {VISUALIZATION_STYLES.map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-8 max-w-2xl space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">Temporal</h2>
        <div className="rounded-xl border border-line p-4 border-line">
          <label htmlFor="resolution" className="block text-sm font-medium text-ink-muted">
            Timeline resolution
          </label>
          <select
            id="resolution"
            value={temporal.resolution}
            onChange={(e) => setResolution(e.target.value as typeof temporal.resolution)}
            className="mt-2 w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border-line bg-surface-raised"
          >
            {TEMPORAL_RESOLUTIONS.map((resolution) => (
              <option key={resolution} value={resolution}>{resolution}</option>
            ))}
          </select>
        </div>
      </section>
    </div>
  );
}
