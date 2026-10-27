import { useState } from 'react';
import { X, Bell, Globe, Layers, Settings, Download, Trash2, Copy, Eye, EyeOff, Mic, Volume2, VolumeX, Sparkles, MessageSquare, Layers as LayersIcon, Globe as GlobeIcon, Zap, Brain, History, HelpCircle, Camera, Video, Image, FileText, Map, Share2, Download as DownloadIcon, Copy as CopyIcon, Trash2 as Trash2Icon } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { VISUALIZATION_STYLES, TEMPORAL_RESOLUTIONS, EXPORT_FORMATS, TEMPORAL_LAYERS, DATA_LAYERS, CHANGE_TYPES, VISUALIZATION_STYLE_METADATA, CHANGE_TYPE_METADATA, CHANGE_DETECTION_ALGORITHMS, FORECASTING_MODELS, SCENARIO_FORCINGS, POLICY_LEVERS, SCENARIO_TYPES, VISUALIZATION_STYLES as VS, CHANGE_TYPES as CT, EXPORT_FORMATS as EF } from '@chronos/shared';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'general' | 'display' | 'layers' | 'notifications' | 'advanced'>('general');
  const { visualizationStyle, temporal, layers, setVisualizationStyle, setResolution, setTimeRange, setPlaying, setSpeed, setDirection, toggleLayer, setLayerOpacity, setLayerStyle } = useChronosStore();

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'display', label: 'Display', icon: Globe },
    { id: 'layers', label: 'Layers', icon: Layers },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-[var(--shadow-pop)] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-line">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-300'
                  : 'text-ink-faint hover:text-ink'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-ink mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Default View</label>
                    <select
                      value="globe"
                      className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="globe">3D Globe</option>
                      <option value="map">2D Map</option>
                      <option value="split">Split View</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Default Temporal Resolution</label>
                    <select
                      value={temporal.resolution}
                      onChange={(e) => { /* setResolution(e.target.value as any); */ }}
                      className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {TEMPORAL_RESOLUTIONS.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Default Visualization Style</label>
                    <select
                      value={visualizationStyle}
                      onChange={(e) => setVisualizationStyle(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {VISUALIZATION_STYLES.map((s) => (
                        <option key={s} value={s}>{VISUALIZATION_STYLE_METADATA[s as keyof typeof VISUALIZATION_STYLE_METADATA]?.label || s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-ink mb-4">Display Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Visualization Style</label>
                    <select
                      value={visualizationStyle}
                      onChange={(e) => setVisualizationStyle(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {VISUALIZATION_STYLES.map((s) => (
                        <option key={s} value={s}>{VISUALIZATION_STYLE_METADATA[s as keyof typeof VISUALIZATION_STYLE_METADATA]?.label || s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Default Time Range</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Start Year" className="px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      <input type="number" placeholder="End Year" className="px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500" />
                      <span className="text-sm text-ink-muted">Show Atmosphere</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500" />
                      <span className="text-sm text-ink-muted">Show Clouds</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500" />
                      <span className="text-sm text-ink-muted">Show Sun Lighting</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500" />
                      <span className="text-sm text-ink-muted">Show Fog</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-ink mb-4">Layer Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Data Layers</label>
                    <div className="space-y-2">
                      {DATA_LAYERS.map((layer) => (
                        <label key={layer} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={layers[layer]?.visible ?? false}
                            onChange={() => toggleLayer(layer)}
                            className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500"
                          />
                          <span className="text-sm text-ink-muted capitalize">{layer.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Temporal Layers</label>
                    <div className="space-y-2">
                      {TEMPORAL_LAYERS.map((layer) => (
                        <label key={layer} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={layers[layer]?.visible ?? false}
                            onChange={() => toggleLayer(layer)}
                            className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500"
                          />
                          <span className="text-sm text-ink-muted capitalize">{layer.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-ink mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500" />
                      <span className="text-sm text-ink-muted">Email Notifications</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500" />
                      <span className="text-sm text-ink-muted">Push Notifications</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500" />
                      <span className="text-sm text-ink-muted">Change Alerts</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500" />
                      <span className="text-sm text-ink-muted">Forecast Updates</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-ink mb-4">Advanced Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Change Detection Algorithm</label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {CHANGE_DETECTION_ALGORITHMS.map((a) => (
                        <option key={a} value={a}>{a.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Forecasting Model</label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {FORECASTING_MODELS.map((m) => (
                        <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">Scenario Forcing</label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {SCENARIO_FORCINGS.map((f) => (
                        <option key={f} value={f}>{f.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}