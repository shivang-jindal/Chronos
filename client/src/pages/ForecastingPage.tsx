import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal, Trash2, Download, Edit, Copy, Sparkles, MessageSquare, Mic, Volume2, VolumeX, Brain, Zap, Layers, Globe, History, Settings, HelpCircle, Calendar, MapPin, Filter, Download as DownloadIcon, Camera, Video, Image, FileText, Map, Share2, Download as DownloadIcon2, Copy as CopyIcon, Trash2 as Trash2Icon, Layers as LayersIcon } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { FORECASTING_MODELS, SCENARIO_FORCINGS, TEMPORAL_LAYERS, VISUALIZATION_STYLES, EXPORT_FORMATS, FORECASTING_MODELS as FM, SCENARIO_FORCINGS as SF, TEMPORAL_LAYERS as TL, VISUALIZATION_STYLES as VS, EXPORT_FORMATS as EF } from '@chronos/shared';
import { useToast } from '../components/Toast';

export function ForecastingPage() {
  const { addToast } = useToast();
  const [params, setParams] = useState({
    layer: 'landsat_annual',
    location: { type: 'point', coordinates: [0, 0] } as any,
    horizonYears: 10,
    model: 'earthformer',
    scenario: 'ssp2_45' as any,
    policyLevers: {} as Record<string, number>,
    confidenceLevel: 0.9,
    ensembleSize: 50,
    outputFormat: 'cog'
  });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'results'>('setup');

  const handleSubmit = async () => {
    setRunning(true);
    try {
      const response = await fetch('/api/v1/forecasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setActiveTab('results');
        addToast({ type: 'success', title: 'Forecast Complete', message: `Generated ${params.horizonYears}-year forecast` });
      } else {
        throw new Error('Forecasting failed');
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed', message: error instanceof Error ? error.message : 'Unexpected error' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-line">
        <h1 className="text-2xl font-bold text-ink">Forecasting</h1>
        <p className="text-ink-muted mt-1">Predict future changes with AI-powered forecasting models</p>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="w-80 border-r border-line p-4 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-ink mb-4">Parameters</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-2">Layer</label>
                <select value={params.layer} onChange={(e) => setParams({ ...params, layer: e.target.value })} className="input">
                  {['landsat_annual', 'sentinel2_annual', 'planet_nicfi_annual', 'night_lights_annual', 'urban_extents_annual', 'water_annual', 'glacier_annual', 'coastline_annual', 'cropland_annual', 'sea_ice_annual'].map((l) => (
                    <option key={l} value={l}>{l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-2">Location</label>
                  <select value={params.location.type} onChange={(e) => setParams({ ...params, location: { ...params.location, type: e.target.value } })} className="input">
                    <option value="point">Point</option>
                    <option value="bbox">Bounding Box</option>
                    <option value="polygon">Polygon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-2">Model</label>
                  <select value={params.model} onChange={(e) => setParams({ ...params, model: e.target.value as any })} className="input">
                    {['earthformer', 'predrnn', 'simvp', 'diffeearth', 'neuralgcm', 'climsim', 'icenet', 'deepice'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-2">Horizon (years)</label>
                  <input type="number" min={1} max={50} value={params.horizonYears} onChange={(e) => setParams({ ...params, horizonYears: parseInt(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-2">Scenario</label>
                  <select value={params.scenario} onChange={(e) => setParams({ ...params, scenario: e.target.value as any })} className="input">
                    {['ssp1_26', 'ssp2_45', 'ssp3_70', 'ssp5_85'].map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-2">Confidence Level</label>
                  <input type="range" min={0.5} max={0.99} step={0.01} value={0.9} className="w-full h-2 bg-surface-raised rounded-full appearance-none accent-brand-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-2">Ensemble Size</label>
                  <input type="number" min={10} max={1000} value={50} className="input" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-muted mb-2">Output Format</label>
                <select className="input">
                  <option value="cog">Cloud Optimized GeoTIFF</option>
                  <option value="netcdf">NetCDF</option>
                  <option value="zarr">Zarr</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <button
                onClick={() => { /* handleSubmit() */ }}
                disabled={false}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Run Forecast
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-surface/60 rounded-xl p-6">
              <h2 className="text-xl font-bold text-ink mb-4">Forecast Results</h2>
              <p className="text-center text-ink-faint py-12">Configure parameters and run forecast to see results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}