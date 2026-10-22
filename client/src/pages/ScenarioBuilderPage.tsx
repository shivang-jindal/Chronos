import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal, Trash2, Download, Edit, Copy, Sparkles, MessageSquare, Mic, Volume2, VolumeX, Brain, Zap, Layers, Globe, History, Settings, HelpCircle, Camera, Video, Image, FileText, Map, Share2, Download as DownloadIcon, Copy as CopyIcon, Trash2 as Trash2Icon, Layers as LayersIcon, Download as DownloadIcon2 } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { SCENARIO_TYPES, POLICY_LEVERS, SCENARIO_FORCINGS, TEMPORAL_LAYERS, CHANGE_TYPES, CHANGE_TYPE_METADATA, SCENARIO_TYPES as ST, POLICY_LEVERS as PL, SCENARIO_FORCINGS as SF, TEMPORAL_LAYERS as TL, CHANGE_TYPES as CT, CHANGE_TYPE_METADATA as CTM } from '@chronos/shared';
import { useToast } from '../components/Toast';

export function ScenarioBuilderPage() {
  const { addToast } = useToast();
  const [scenario, setScenario] = useState({
    name: '',
    description: '',
    type: 'custom' as 'business_as_usual' | 'aggressive_mitigation' | 'worst_case' | 'custom',
    baseYear: 2024,
    horizonYear: 2050,
    forcings: {} as Record<string, number>,
    policyLevers: {} as Record<string, number>,
    climateModel: 'ssp2_45',
    region: { west: -180, south: -90, east: 180, north: 90 },
    layers: [] as string[],
    ensembleSize: 50
  });

  const [activeTab, setActiveTab] = useState<'basics' | 'forcings' | 'policies' | 'advanced'>('basics');
  const [running, setRunning] = useState(false);

  const handleSubmit = async () => {
    setRunning(true);
    try {
      const response = await fetch('/api/v1/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario)
      });
      if (response.ok) {
        addToast({ type: 'success', title: 'Scenario Created', message: 'Your scenario has been created' });
      } else {
        throw new Error('Failed to create scenario');
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed', message: error instanceof Error ? error.message : 'Unexpected error' });
    } finally {
      setRunning(false);
    }
  };

  const handlePolicyChange = (lever: string, value: number) => {
    setScenario(prev => ({
      ...prev,
      policyLevers: { ...prev.policyLevers, [lever]: value }
    }));
  };

  const handleForcingChange = (forcing: string, value: number) => {
    setScenario(prev => ({
      ...prev,
      forcings: { ...prev.forcings, [forcing]: value }
    }));
  };

  const handleLayerToggle = (layer: string) => {
    setScenario(prev => ({
      ...prev,
      layers: prev.layers.includes(layer)
        ? prev.layers.filter(l => l !== layer)
        : [...prev.layers, layer]
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scenario Builder</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Create what-if scenarios with climate forcings and policy levers</p>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scenario Name</label>
                <input type="text" value={scenario.name} onChange={(e) => setScenario({ ...scenario, name: e.target.value })} placeholder="Enter scenario name" className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={scenario.description} onChange={(e) => setScenario({ ...scenario, description: e.target.value })} placeholder="Describe your scenario..." rows={3} className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scenario Type</label>
                  <select value={scenario.type} onChange={(e) => setScenario({ ...scenario, type: e.target.value as any })} className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {['business_as_usual', 'aggressive_mitigation', 'worst_case', 'custom'].map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Base Year</label>
                  <input type="number" value={scenario.baseYear} onChange={(e) => setScenario({ ...scenario, baseYear: parseInt(e.target.value) })} min={1984} max={2024} className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Horizon Year</label>
                  <input type="number" value={scenario.horizonYear} onChange={(e) => setScenario({ ...scenario, horizonYear: parseInt(e.target.value) })} min={2025} max={2100} className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Climate Model</label>
                  <select value={scenario.climateModel} onChange={(e) => setScenario({ ...scenario, climateModel: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {['ssp1_26', 'ssp2_45', 'ssp3_70', 'ssp5_85'].map((m) => (
                      <option key={m} value={m}>{m.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Scenario Preview</h2>
              <p className="text-center text-slate-500 dark:text-slate-400">Configure parameters to preview scenario</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}