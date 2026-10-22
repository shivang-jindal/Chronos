import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal, Trash2, Download, Edit, Copy, Sparkles, MessageSquare, Mic, Volume2, VolumeX, Brain, Zap, Layers, Globe, History, Settings, HelpCircle, Camera, Video, Image, FileText, Map, Share2, Download as DownloadIcon, Copy as CopyIcon, Trash2 as Trash2Icon, Layers as LayersIcon, Download as DownloadIcon2 } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { CHANGE_TYPES, CHANGE_TYPE_METADATA, TEMPORAL_LAYERS, CHANGE_DETECTION_ALGORITHMS, TEMPORAL_LAYERS as TL, CHANGE_TYPES as CT, CHANGE_TYPE_METADATA as CTM } from '@chronos/shared';
import { useToast } from '../components/Toast';

export function ChangeDetectionPage() {
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
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Change Detection</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Detect and analyze changes in Earth's surface over time</p>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Layer</label>
                <select
                  value={params.layer}
                  onChange={(e) => setParams({ ...params, layer: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {['landsat_annual', 'sentinel2_annual', 'planet_nicfi_annual', 'night_lights_annual', 'urban_extents_annual', 'water_annual', 'glacier_annual', 'coastline_annual', 'cropland_annual', 'sea_ice_annual'].map((l) => (
                    <option key={l} value={l}>{l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                  <input type="date" value={params.startDate} onChange={(e) => setParams({ ...params, startDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                  <input type="date" value={params.endDate} onChange={(e) => setParams({ ...params, endDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Algorithm</label>
                <select value={params.algorithm} onChange={(e) => setParams({ ...params, algorithm: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {['ccdc', 'radd', 'bfast', 'landtrendr', 'tscd', 'sma'].map((a) => (
                    <option key={a} value={a}>{a.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Change Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {['deforestation', 'urban_expansion', 'water_change', 'glacier_change', 'coastline_change', 'cropland_change', 'mining_expansion', 'coastal_erosion', 'glacier_mass_balance', 'night_light_delta', 'fire', 'flood', 'landslide', 'volcanic', 'oil_spill'].map((ct) => (
                    <label key={ct} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={false} onChange={() => {}} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{ct.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confidence Threshold: 0.6</label>
                  <input type="range" min={0} max={1} step={0.05} value={0.6} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none accent-brand-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Min Area (ha): 0.1</label>
                  <input type="range" min={0.01} max={100} step={0.01} value={0.1} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none accent-brand-600" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Output Format</label>
                <select className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="geojson">GeoJSON</option>
                  <option value="cog">Cloud Optimized GeoTIFF</option>
                  <option value="netcdf">NetCDF</option>
                  <option value="zarr">Zarr</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <button
                onClick={() => { /* handleSubmit() */ }}
                disabled={false}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Run Detection
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Change Detection Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Total Changes</p>
                  <p className="font-bold text-3xl text-brand-600">—</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Total Area (ha)</p>
                  <p className="font-bold text-3xl text-brand-600">—</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Processing Time</p>
                  <p className="font-bold text-3xl text-brand-600">—</p>
                </div>
              </div>
              <p className="text-center text-slate-500 dark:text-slate-400">Configure parameters and run detection to see results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}