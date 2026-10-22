import { useChronosStore } from '../store/chronosStore';
import { VISUALIZATION_STYLES, TEMPORAL_RESOLUTIONS } from '@chronos/shared';

export function SettingsPage() {
  const { visualizationStyle, setVisualizationStyle, temporal, setResolution } = useChronosStore();

  return (
    <div className="h-full overflow-y-auto bg-white p-6 dark:bg-slate-950">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">Tune how Chronos renders and animates time.</p>

      <section className="mt-8 max-w-2xl space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Visualisation</h2>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <label htmlFor="visualization-style" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Default visualization style
          </label>
          <select
            id="visualization-style"
            value={visualizationStyle}
            onChange={(e) => setVisualizationStyle(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
          >
            {VISUALIZATION_STYLES.map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-8 max-w-2xl space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Temporal</h2>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <label htmlFor="resolution" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Timeline resolution
          </label>
          <select
            id="resolution"
            value={temporal.resolution}
            onChange={(e) => setResolution(e.target.value as typeof temporal.resolution)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
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
