import { useState } from 'react';
import { X, Share2, Link, Copy, Check, ExternalLink, Globe, Layers, Zap, Brain, History, Settings, HelpCircle, Camera, Video, Image, FileText, Map, Share2 as Share2Icon, Download as DownloadIcon, Copy as CopyIcon, Layers as LayersIcon } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const { temporal, layers, visualizationStyle, timeRange } = useChronosStore();
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'link' | 'embed' | 'scene'>('link');

  const baseUrl = window.location.origin;

  const generateShareUrl = () => {
    const payload = {
      lat: 0,
      lon: 0,
      zoom: 2,
      time: {
        mode: 'range',
        value: { start: '1984-01-01', end: '2024-12-31' }
      },
      layers: Object.entries(useChronosStore.getState().layers)
        .filter(([_, config]) => config.visible)
        .map(([id, config]) => ({
          id,
          visible: config.visible,
          opacity: config.opacity,
          style: config.style
        })),
      camera: {
        lat: 0,
        lon: 0,
        zoom: 2,
        bearing: 0,
        pitch: 0
      }
    };

    const encoded = btoa(JSON.stringify(payload));
    return `${baseUrl}/?share=${encoded}`;
  };

  const fullUrl = generateShareUrl();
  const sceneData = {
    time: { currentYear: temporal.currentYear, startYear: temporal.startYear, endYear: temporal.endYear },
    layers: Object.entries(layers)
      .filter(([, config]) => config.visible)
      .map(([id, config]) => ({ id, opacity: config.opacity, style: config.style })),
    visualizationStyle,
    timeRange
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    // Show toast
  };

  const handleEmbedCopy = () => {
    const embedCode = `<iframe src="${fullUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    // Show toast
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-[var(--shadow-pop)] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">Share Chronos View</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-line">
            {['link', 'embed', 'scene'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as 'link' | 'embed' | 'scene')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-brand-500 text-brand-300'
                    : 'text-ink-faint hover:text-ink'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Link Tab */}
          {tab === 'link' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-ink-muted mb-2">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fullUrl}
                  readOnly
                  className="flex-1 input"
                />
                <button
                  onClick={handleCopy}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              {copied && <p className="text-sm text-emerald-400">Copied to clipboard!</p>}
            </div>
          )}

          {/* Embed Tab */}
          {tab === 'embed' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-ink-muted mb-2">Embed Code</label>
              <div className="relative">
                <textarea
                  readOnly
                  value={`<iframe src="${fullUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`}
                  rows={4}
                  className="textarea w-full font-mono resize-none"
                />
                <button
                  onClick={handleEmbedCopy}
                  className="btn btn-primary absolute right-2 top-2 px-3 py-1 text-xs"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Scene Tab */}
          {tab === 'scene' && (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                Share a complete scene with camera position, time, layers, and annotations.
              </p>
              <div className="bg-surface/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ink-muted">Scene Data</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(sceneData, null, 2))}
                    className="btn btn-ghost px-3 py-1 text-xs text-brand-300"
                  >
                    <Copy className="w-3 h-3 mr-1" /> Copy JSON
                  </button>
                </div>
                <pre className="bg-surface-raised text-green-300 p-3 rounded text-xs overflow-auto max-h-48">
                  {JSON.stringify(sceneData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-line">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}