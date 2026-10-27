import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal, Trash2, Download, Edit, Copy, Globe, Layers, History, Zap, Brain, Search, Upload, Settings, Eye as EyeIcon, EyeOff as EyeOffIcon, Globe as GlobeIcon, Layers as LayersIcon, History as HistoryIcon, Zap as ZapIcon, Brain as BrainIcon, Search as SearchIcon, Settings as SettingsIcon, Download as DownloadIcon, Edit as EditIcon, Copy as CopyIcon, Trash2 as Trash2Icon } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { DATA_LAYERS, TEMPORAL_LAYERS, VISUALIZATION_STYLES, VISUALIZATION_STYLE_METADATA, CHANGE_TYPES, CHANGE_TYPE_METADATA, TEMPORAL_LAYERS as TL, DATA_LAYERS as DL, VISUALIZATION_STYLES as VS } from '@chronos/shared';

interface LayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LayerPanel({ isOpen, onClose }: LayerPanelProps) {
  const { layers, toggleLayer, setLayerOpacity, setLayerStyle, setVisualizationStyle, visualizationStyle } = useChronosStore();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Temporal Layers': true,
    'Data Layers': true,
    'Change Detection': false,
    'Visualization': true
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const layerCategories = {
    'Temporal Layers': TEMPORAL_LAYERS,
    'Data Layers': DATA_LAYERS,
    'Change Detection': CHANGE_TYPES,
    'Visualization': VISUALIZATION_STYLES
  };

  const getLayerConfig = (layerId: string) => {
    const config = {
      visible: true,
      opacity: 1,
      style: 'natural',
      timeEnabled: true
    };
    // Get actual layer config from store
    const layerConfig = useChronosStore.getState().layers[layerId];
    return { ...config, ...layerConfig };
  };

  const handleToggleLayer = (layerId: string) => {
    const layer = useChronosStore.getState().layers[layerId];
    const newVisible = !layer?.visible;
    useChronosStore.getState().toggleLayer(layerId, !layer?.visible);
  };

  const handleOpacityChange = (layerId: string, value: number) => {
    useChronosStore.getState().setLayerOpacity(layerId, value);
  };

  const handleStyleChange = (layerId: string, style: string) => {
    useChronosStore.getState().setLayerStyle(layerId, style);
  };

  const handleVisualizationStyleChange = (style: string) => {
    useChronosStore.getState().setVisualizationStyle(style);
  };

  const getLayerIcon = (layerId: string) => {
    if (TL.includes(layerId as any)) return <History className="w-4 h-4" />;
    if (DL.includes(layerId as any)) return <LayersIcon className="w-4 h-4" />;
    if (CHANGE_TYPES.includes(layerId as any)) return <History className="w-4 h-4" />;
    return <GlobeIcon className="w-4 h-4" />;
  };

  const getLayerLabel = (layerId: string) => {
    const metadata = VISUALIZATION_STYLE_METADATA[layerId as keyof typeof VISUALIZATION_STYLE_METADATA];
    if (metadata) return metadata.label;
    
    const changeMeta = CHANGE_TYPE_METADATA[layerId as keyof typeof CHANGE_TYPE_METADATA];
    if (changeMeta) return changeMeta.label;
    
    return layerId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className={`fixed right-0 top-16 bottom-0 w-80 bg-surface border-l border-line z-40 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-line">
        <h2 className="text-lg font-semibold text-ink">Layers</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5"
          aria-label="Close layers panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-line">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Search layers..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(layerCategories).map(([category, layerIds]) => (
          <div key={category} className="space-y-2">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-2 py-1 text-sm font-medium text-ink-muted hover:text-ink"
            >
              <span className="flex items-center gap-2">
                {category === 'Temporal Layers' && <History className="w-4 h-4" />}
                {category === 'Data Layers' && <LayersIcon className="w-4 h-4" />}
                {category === 'Change Detection' && <HistoryIcon className="w-4 h-4" />}
                {category === 'Visualization' && <GlobeIcon className="w-4 h-4" />}
                <span>{category}</span>
                <span className="text-xs text-ink-faint bg-surface-raised px-2 py-0.5 rounded-full">
                  {layerIds.length}
                </span>
              </span>
              {expandedCategories[category] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedCategories[category] && (
              <div className="mt-2 space-y-1 pl-4 border-l border-line">
                {layerIds.map((layerId) => {
                  const config = getLayerConfig(layerId);
                  const label = getLayerLabel(layerId);
                  const iconElement = getLayerIcon(layerId);

                  return (
                    <div key={layerId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <button
                        onClick={() => handleToggleLayer(layerId)}
                        className={`p-1.5 rounded transition-colors ${config.visible ? 'bg-brand-500/15 text-brand-200' : 'text-ink-faint hover:bg-white/5'}`}
                        aria-label={config.visible ? `Hide ${label}` : `Show ${label}`}
                        aria-pressed={config.visible}
                      >
                        {iconElement}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-ink truncate">{label}</span>
                          <span className="text-xs text-ink-faint capitalize">{config.style}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={Math.round(config.opacity * 100)}
                            onChange={(e) => handleOpacityChange(layerId, parseInt(e.target.value) / 100)}
                            className="flex-1 h-1.5 bg-surface-raised rounded-full appearance-none accent-brand-600"
                            aria-label={`${label} opacity`}
                          />
                          <span className="text-xs text-ink-faint w-10 text-right">
                            {Math.round(config.opacity * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <select
                          value={config.style}
                          onChange={(e) => handleStyleChange(layerId, e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-surface-raised border border-line rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                          aria-label={`${label} visualization style`}
                        >
                          {VISUALIZATION_STYLES.map((style) => (
                            <option key={style} value={style}>
                              {VISUALIZATION_STYLE_METADATA[style as keyof typeof VISUALIZATION_STYLE_METADATA]?.label || style}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => { /* open layer settings */ }}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors"
                          aria-label={`${label} settings`}
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { /* duplicate layer */ }}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors"
                          aria-label={`Duplicate ${label}`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { /* remove layer */ }}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors text-red-500"
                          aria-label={`Remove ${label}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-line space-y-2">
        <button
          onClick={() => { /* add new layer */ }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-brand-300 hover:bg-brand-500/10 rounded-lg transition-colors"
        >
          <Layers className="w-4 h-4" />
          <span>Add Layer</span>
        </button>
        <button
          onClick={() => { /* save layer preset */ }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-ink-muted hover:bg-white/5 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Save Preset</span>
        </button>
        <button
          onClick={() => { /* load layer preset */ }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-ink-muted hover:bg-white/5 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Load Preset</span>
        </button>
      </div>
    </div>
  );
}