import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal, Trash2, Download, Edit, Copy, Sparkles, MessageSquare, Mic, Volume2, VolumeX, Brain, Zap, Layers, Globe, History, Settings, HelpCircle, Camera, Video, Image, FileText, Map, Share2, Loader2, Calendar, MapPin, Filter, Download as DownloadIcon, Copy as CopyIcon, Trash2 as Trash2Icon, Layers as LayersIcon, Download as DownloadIcon2 } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { useToast } from './Toast';
import { CHANGE_TYPES, CHANGE_TYPE_METADATA, TEMPORAL_LAYERS, CHANGE_DETECTION_ALGORITHMS, TEMPORAL_LAYERS as TL, CHANGE_TYPES as CT, CHANGE_TYPE_METADATA as CTM } from '@chronos/shared';

interface ChangeDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeDetectionModal({ isOpen, onClose }: ChangeDetectionModalProps) {
  const { addToast } = useToast();
  const [params, setParams] = useState({
    layer: 'landsat_annual',
    startDate: '2020-01-01',
    endDate: '2024-12-31',
    algorithm: 'ccdc',
    changeTypes: [] as string[],
    confidenceThreshold: 0.6,
    minAreaHa: 0.1,
    outputFormat: 'geojson'
  });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async () => {
    setRunning(true);
    try {
      const response = await fetch('/api/v1/change-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        addToast({ type: 'success', title: 'Analysis Complete', message: `Found ${data.summary.totalChanges} changes` });
      } else {
        throw new Error('Change detection failed');
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed', message: error instanceof Error ? error.message : 'Unexpected error' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-[var(--shadow-pop)] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">Change Detection</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Layer</label>
            <select
              value={params.layer}
              onChange={(e) => setParams({ ...params, layer: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {TEMPORAL_LAYERS.map((l) => (
                <option key={l} value={l}>{l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Start Date</label>
              <input
                type="date"
                value={params.startDate}
                onChange={(e) => setParams({ ...params, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">End Date</label>
              <input
                type="date"
                value={params.endDate}
                onChange={(e) => setParams({ ...params, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Algorithm</label>
            <select
              value={params.algorithm}
              onChange={(e) => setParams({ ...params, algorithm: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CHANGE_DETECTION_ALGORITHMS.map((a) => (
                <option key={a} value={a}>{a.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Change Types</label>
            <div className="grid grid-cols-3 gap-2">
              {CHANGE_TYPES.map((ct) => (
                <label key={ct} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.changeTypes.includes(ct)}
                    onChange={(e) => setParams({
                      ...params,
                      changeTypes: e.target.checked
                        ? [...params.changeTypes, ct]
                        : params.changeTypes.filter(c => c !== ct)
                    })}
                    className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500"
                  />
                  <span className="text-sm text-ink-muted capitalize">{ct.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Confidence Threshold: {params.confidenceThreshold}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={params.confidenceThreshold}
                onChange={(e) => setParams({ ...params, confidenceThreshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-surface-raised rounded-full appearance-none accent-brand-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Min Area (ha): {params.minAreaHa}</label>
              <input
                type="range"
                min={0.01}
                max={100}
                step={0.01}
                value={params.minAreaHa}
                onChange={(e) => setParams({ ...params, minAreaHa: parseFloat(e.target.value) })}
                className="w-full h-2 bg-surface-raised rounded-full appearance-none accent-brand-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Output Format</label>
            <select
              value={params.outputFormat}
              onChange={(e) => setParams({ ...params, outputFormat: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="geojson">GeoJSON</option>
              <option value="cog">Cloud Optimized GeoTIFF</option>
              <option value="netcdf">NetCDF</option>
              <option value="zarr">Zarr</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          {results && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-300 mb-2">Results</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-surface-raised p-3 rounded">
                  <p className="text-ink-faint">Total Changes</p>
                  <p className="font-bold text-2xl">{results.summary?.totalChanges || 0}</p>
                </div>
                <div className="bg-surface-raised p-3 rounded">
                  <p className="text-ink-faint">Total Area (ha)</p>
                  <p className="font-bold text-2xl">{results.summary?.totalAreaHa?.toFixed(1) || 0}</p>
                </div>
                <div className="bg-surface-raised p-3 rounded">
                  <p className="text-ink-faint">Processing Time</p>
                  <p className="font-bold text-2xl">{results.metadata?.processingTimeMs || 0}ms</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.entries(results.summary?.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between py-1 border-b border-line">
                    <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{String(count)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-line">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-ink-muted hover:bg-white/5 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={running}
            className="px-4 py-2 text-sm font-medium text-[#04121d] bg-brand-500 hover:bg-brand-400 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {running ? 'Running...' : 'Run Detection'}
          </button>
        </div>
      </div>
    </div>
  );
}