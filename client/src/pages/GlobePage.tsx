import { Globe } from '../components/Globe';
import { useChronosStore } from '../store/chronosStore';

export function GlobePage() {
  const { temporal, visualizationStyle } = useChronosStore();

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,64,175,0.35),transparent_65%)]" />
      <div className="relative h-[min(80vh,720px)] w-[min(80vh,720px)]">
        <Globe />
      </div>

      <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-slate-700/60 bg-slate-950/70 px-4 py-3 backdrop-blur">
        <p className="text-xs uppercase tracking-widest text-slate-400">Temporal view</p>
        <p className="text-2xl font-semibold text-white">{temporal.currentYear}</p>
        <p className="text-xs text-slate-400">
          {temporal.startYear}–{temporal.endYear} · {visualizationStyle} style
        </p>
      </div>

      <div className="absolute bottom-4 right-4 rounded-xl border border-slate-700/60 bg-slate-950/70 px-4 py-3 text-xs text-slate-300 backdrop-blur">
        <p className="font-medium text-slate-100">Drag to rotate · Scroll to zoom</p>
        <p className="mt-1 text-slate-400">Satellite layers stream on demand once a data source is connected.</p>
      </div>
    </div>
  );
}
