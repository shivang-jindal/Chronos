import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal, Trash2, Download, Edit, Copy, Sparkles, MessageSquare, Mic, Volume2, VolumeX, Brain, Zap, Layers, Globe, History, Settings, HelpCircle, Calendar, MapPin, Filter, Download as DownloadIcon } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { FORECASTING_MODELS, SCENARIO_FORCINGS, TEMPORAL_LAYERS, VISUALIZATION_STYLES, EXPORT_FORMATS } from '@chronos/shared';
import { useToast } from './Toast';

interface ForecastingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForecastingModal({ isOpen, onClose }: ForecastingModalProps) {
  if (!isOpen) return null;

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
        setActiveTab('results' as 'setup' | 'results');
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

  useEffect(() => {
    // effect logic here if needed
  }, [addToast]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Forecasting</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {['setup', 'results'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as 'setup' | 'results')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Layer</label>
                <select
                  value={params.layer}
                  onChange={(e) => setParams({ ...params, layer: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {TEMPORAL_LAYERS.map((l) => (
                    <option key={l} value={l}>{l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
                  <select
                    value={params.location.type}
                    onChange={(e) => setParams({ ...params, location: { ...params.location, type: e.target.value } })}
                    className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="point">Point</option>
                    <option value="bbox">Bounding Box</option>
                    <option value="polygon">Polygon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Coordinates</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      value={params.location.coordinates?.[0] || ''}
                      onChange={(e) => setParams({ ...params, location: { ...params.location, coordinates: [parseFloat(e.target.value), params.location.coordinates?.[1] || 0] } })}
                      className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      value={params.location.coordinates?.[1] || ''}
                      onChange={(e) => setParams({ ...params, location: { ...params.location, coordinates: [params.location.coordinates?.[0] || 0, parseFloat(e.target.value)] } })}
                      className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Horizon (years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={params.horizonYears}
                    onChange={(e) => setParams({ ...params, horizonYears: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Model</label>
                  <select
                    value={params.model}
                    onChange={(e) => setParams({ ...params, model: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {FORECASTING_MODELS.map((m) => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scenario</label>
                  <select
                    value={params.scenario}
                    onChange={(e) => setParams({ ...params, scenario: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {SCENARIO_FORCINGS.map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confidence Level</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="0.99"
                    value={params.confidenceLevel}
                    onChange={(e) => setParams({ ...params, confidenceLevel: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ensemble Size</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={params.ensembleSize}
                    onChange={(e) => setParams({ ...params, ensembleSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Output Format</label>
                  <select
                    value={params.outputFormat}
                    onChange={(e) => setParams({ ...params, outputFormat: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {EXPORT_FORMATS.map((f) => (
                      <option key={f} value={f}>{f.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && results && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Forecast Results</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Model</p>
                    <p className="font-medium">{results.model || params.model}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Scenario</p>
                    <p className="font-medium">{results.scenario || params.scenario}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Horizon</p>
                    <p className="font-medium">{params.horizonYears} years</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Confidence</p>
                    <p className="font-medium">{(params.confidenceLevel * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Ensemble Size</p>
                    <p className="font-medium">{params.ensembleSize}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Output Format</p>
                    <p className="font-medium">{params.outputFormat.toUpperCase()}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-slate-900 dark:text-white">Yearly Predictions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left p-2 text-slate-500 dark:text-slate-400">Year</th>
                        <th className="text-left p-2 text-slate-500 dark:text-slate-400">Value</th>
                        <th className="text-left p-2 text-slate-500 dark:text-slate-400">Lower Bound</th>
                        <th className="text-left p-2 text-slate-500 dark:text-slate-400">Upper Bound</th>
                        <th className="text-left p-2 text-slate-500 dark:text-slate-400">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.predictions?.map((p: any, i: number) => (
                        <tr key={i} className="border-b border-slate-200 dark:border-slate-700">
                          <td className="p-2">{p.year}</td>
                          <td className="p-2">{p.value.toFixed(2)}</td>
                          <td className="p-2">{p.lowerBound?.toFixed(2) ?? 'N/A'}</td>
                          <td className="p-2">{p.upperBound?.toFixed(2) ?? 'N/A'}</td>
                          <td className="p-2">{(p.confidence * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}