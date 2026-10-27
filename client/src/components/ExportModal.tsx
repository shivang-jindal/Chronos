import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, MicOff, Loader2, Copy, ThumbsUp, ThumbsDown, Flag, MoreVertical, Download, Share2, Edit, Trash2, Sparkles, MessageSquare, Mic as MicIcon, Volume2, VolumeX, Brain, Zap, Layers, Globe, History, Settings, HelpCircle, Camera, Video, Image, FileText, Map, Download as DownloadIcon, Copy as CopyIcon, Trash2 as Trash2Icon } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { VISUALIZATION_STYLES, VISUALIZATION_STYLE_METADATA, EXPORT_FORMATS } from '@chronos/shared';
import { useToast } from './Toast';

export function ExportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const [bbox, setBbox] = useState({ west: -180, south: -90, east: 180, north: 90 });
  const [startDate, setStartDate] = useState('1984-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [style, setStyle] = useState('natural');
  const [resolution, setResolution] = useState('');
  const [crs, setCrs] = useState('EPSG:4326');
  const [compression, setCompression] = useState({ enabled: true, quality: 85 });
  const [exportLayer, setExportLayer] = useState('landsat');
  const [format, setFormat] = useState<string>('geotiff');

  const { addToast } = useToast();

  const handleSubmit = () => {
    addToast({ type: 'success', title: 'Export Started', message: 'Your export has been queued' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-[var(--shadow-pop)] max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">Export Data</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Bounding Box */}
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Bounding Box (W, S, E, N)</label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                step="0.0001"
                min={-180}
                max={180}
                value={bbox.west}
                onChange={(e) => setBbox({ ...bbox, west: parseFloat(e.target.value) })}
                className="input"
                placeholder="West"
              />
              <input
                type="number"
                step="0.0001"
                min={-90}
                max={90}
                value={bbox.south}
                onChange={(e) => setBbox({ ...bbox, south: parseFloat(e.target.value) })}
                className="input"
                placeholder="South"
              />
              <input
                type="number"
                step="0.0001"
                min={-180}
                max={180}
                value={bbox.east}
                onChange={(e) => setBbox({ ...bbox, east: parseFloat(e.target.value) })}
                className="input"
                placeholder="East"
              />
              <input
                type="number"
                step="0.0001"
                min={-90}
                max={90}
                value={bbox.north}
                onChange={(e) => setBbox({ ...bbox, north: parseFloat(e.target.value) })}
                className="input"
                placeholder="North"
              />
            </div>
            <p className="text-xs text-ink-faint mt-1">Current view: {bbox.west.toFixed(4)}, {bbox.south.toFixed(4)}, {bbox.east.toFixed(4)}, {bbox.north.toFixed(4)}</p>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Time Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 input"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 input"
              />
            </div>
          </div>

          {/* Visualization Style */}
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Visualization Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="input"
            >
              {VISUALIZATION_STYLES.map((style) => (
                <option key={style} value={style}>
                  {VISUALIZATION_STYLE_METADATA[style as keyof typeof VISUALIZATION_STYLE_METADATA]?.label || style}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Resolution (meters/pixel, optional)</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Auto (based on zoom)"
              className="input"
            />
          </div>

          {/* CRS */}
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Coordinate Reference System</label>
            <select
              value={crs}
              onChange={(e) => setCrs(e.target.value)}
              className="input"
            >
              <option value="EPSG:4326">EPSG:4326 (WGS84)</option>
              <option value="EPSG:3857">EPSG:3857 (Web Mercator)</option>
              <option value="EPSG:32662">EPSG:32662 (WGS84 / UTM zone 62N)</option>
              <option value="EPSG:6933">EPSG:6933 (WGS84 / NSIDC EASE-Grid 2.0 Global)</option>
            </select>
          </div>

          {/* Compression */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={compression.enabled}
                onChange={(e) => setCompression({ ...compression, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500"
              />
              <span className="text-sm text-ink-muted">Enable Compression</span>
            </label>
            {compression.enabled && (
              <div className="mt-2 ml-6">
                <label className="block text-sm font-medium text-ink-muted mb-1">Quality</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={compression.quality}
                  onChange={(e) => setCompression({ ...compression, quality: parseInt(e.target.value) })}
                  className="w-24 input"
                />
              </div>
            )}
          </div>

          {/* Export Layer */}
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Export Layer</label>
            <select
              value={exportLayer}
              onChange={(e) => setExportLayer(e.target.value)}
              className="input"
            >
              <option value="landsat">Landsat</option>
              <option value="sentinel2">Sentinel-2</option>
              <option value="planet">Planet NICFI</option>
              <option value="night_lights">Night Lights</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="input"
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-line">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn btn-primary">
            Start Export
          </button>
        </div>
      </div>
    </div>
  );
}