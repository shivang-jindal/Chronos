import { useRef, useEffect, useCallback } from 'react';
import { useChronosStore } from '../store/chronosStore';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, Rewind, ChevronLeft, ChevronRight, Calendar, Clock, Zap, Globe, Brain, Layers, Settings, HelpCircle, ChevronDown, ChevronUp, Download, Share2, Mic, MicOff, Maximize, Minimize, History, Zap as ZapIcon, Globe as GlobeIcon, Brain as BrainIcon, Layers as LayersIcon2, Search as SearchIcon, Settings as SettingsIcon, History as HistoryIcon, Zap as ZapIcon2, Globe as GlobeIcon2, Brain as BrainIcon2, Layers as LayersIcon3, Search as SearchIcon2, Settings as SettingsIcon2, History as HistoryIcon2, Zap as ZapIcon3, Globe as GlobeIcon3, Brain as BrainIcon3, Layers as LayersIcon4, Search as SearchIcon3, Settings as SettingsIcon3 } from 'lucide-react';
import { useToast } from './Toast';
import { temporalResolutionSchema, TEMPORAL_RESOLUTIONS, VISUALIZATION_STYLES, VISUALIZATION_STYLE_METADATA, CHANGE_TYPES, CHANGE_TYPE_METADATA } from '@chronos/shared';
import { z } from 'zod';

export function TemporalControl() {
  const { addToast } = useToast();
  const {
    temporal,
    timeRange,
    visualizationStyle,
    animationPlaying,
    animationSpeed,
    comparisonMode,
    comparisonA,
    comparisonB,
    setCurrentYear,
    setTimeRange,
    setResolution,
    setPlaying,
    setSpeed,
    setDirection,
    setVisualizationStyle,
    setTimeRange: setTimeRangeStore,
    setAnimationPlaying,
    setAnimationSpeed,
    setComparisonMode,
    setComparisonA,
    setComparisonB
  } = useChronosStore();

  const yearInputRef = useRef<HTMLInputElement>(null);
  const startYearRef = useRef<HTMLInputElement>(null);
  const endYearRef = useRef<HTMLInputElement>(null);

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    if (!isNaN(year) && year >= 1984 && year <= 2050) {
      setCurrentYear(year);
    }
  }, [setCurrentYear]);

  const handleStartYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    if (!isNaN(year) && year >= 1984 && year <= 2050) {
      setTimeRange({ start: year, end: Math.max(year, temporal.endYear) });
    }
  }, [temporal.endYear]);

  const handleEndYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    if (!isNaN(year) && year >= 1984 && year <= 2050) {
      setTimeRange({ start: Math.min(temporal.startYear, year), end: year });
    }
  }, [temporal.startYear]);

  const handleResolutionChange = (resolution: 'year' | 'quarter' | 'month' | 'week' | 'day') => {
    setResolution(resolution);
  };

  const handleStyleChange = (style: string) => {
    // Set visualization style
  };

  const handleTimeRangeChange = (range: { start: number; end: number }) => {
    // Update time range
  };

  const togglePlay = () => {
    // Toggle play/pause
  };

  const handleSpeedChange = (speed: number) => {
    // Update animation speed
  };

  const handleDirectionChange = (direction: 'forward' | 'backward') => {
    // Set direction
  };

  const handleComparisonToggle = () => {
    // Toggle comparison mode
  };

  const handleComparisonAChange = (data: { year: number; layer: string } | null) => {
    // Update comparison A
  };

  const handleComparisonBChange = (data: { year: number; layer: string } | null) => {
    // Update comparison B
  };

  return (
    <div className="flex items-center gap-3 flex-1 max-w-4xl mx-auto">
      {/* Year Display & Input */}
      <div className="flex items-center gap-2">
        <label htmlFor="year-input" className="sr-only">Current Year</label>
        <input
          ref={yearInputRef}
          id="year-input"
          type="number"
          min={1984}
          max={2050}
          value={temporal.currentYear}
          onChange={handleYearChange}
          className="w-20 px-2 py-1.5 text-sm font-mono text-center bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Current year"
        />

        {/* Resolution Selector */}
        <select
          value={temporal.resolution}
          onChange={(e) => handleResolutionChange(e.target.value as 'year' | 'quarter' | 'month' | 'week' | 'day')}
          className="px-2 py-1.5 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Temporal resolution"
        >
          {TEMPORAL_RESOLUTIONS.map((res) => (
            <option key={res} value={res}>{res.charAt(0).toUpperCase() + res.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Time Range Controls */}
      <div className="flex items-center gap-1 ml-4 border-l border-line pl-4">
        <label htmlFor="start-year" className="sr-only">Start Year</label>
        <input
          ref={startYearRef}
          id="start-year"
          type="number"
          min={1984}
          max={2050}
          value={temporal.startYear}
          onChange={handleStartYearChange}
          className="w-16 px-2 py-1.5 text-sm font-mono text-center bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Start year"
        />
        <span className="text-ink-faint">–</span>
        <label htmlFor="end-year" className="sr-only">End Year</label>
        <input
          ref={endYearRef}
          id="end-year"
          type="number"
          min={1984}
          max={2050}
          value={temporal.endYear}
          onChange={handleEndYearChange}
          className="w-16 px-2 py-1.5 text-sm font-mono text-center bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="End year"
        />
      </div>

      {/* Visualization Style Selector */}
      <div className="ml-4 border-l border-line pl-4">
        <select
          value={visualizationStyle}
          onChange={(e) => setVisualizationStyle(e.target.value)}
          className="px-2 py-1.5 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Visualization style"
        >
          {VISUALIZATION_STYLES.map((style) => (
            <option key={style} value={style}>
              {VISUALIZATION_STYLE_METADATA[style as keyof typeof VISUALIZATION_STYLE_METADATA]?.label || style}
            </option>
          ))}
        </select>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-1 ml-4 border-l border-line pl-4">
        <button
          onClick={() => { /* setDirection('backward'); temporal.setPlaying(true); */ }}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Play backward"
        >
          <Rewind className="w-5 h-5" />
        </button>
        <button
          onClick={() => { /* temporal.setPlaying(!playing); */ }}
          className={`p-2 rounded-lg transition-colors ${/* playing ? 'bg-brand-500/15 text-brand-200' : */ ''}`}
          aria-label={/* playing ? 'Pause' : */ 'Play'}
        >
          {/* playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" /> */}
          <Play className="w-5 h-5" />
        </button>
        <button
          onClick={() => { /* setDirection('forward'); temporal.setPlaying(true); */ }}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Play forward"
        >
          <FastForward className="w-5 h-5" />
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-1 ml-4 border-l border-line pl-4">
        <label htmlFor="speed" className="sr-only">Animation Speed</label>
        <select
          value={1}
          onChange={(e) => { /* setAnimationSpeed(Number(e.target.value)); */ }}
          className="px-2 py-1.5 text-sm bg-surface-raised border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Animation speed"
        >
          {[0.25, 0.5, 1, 2, 5, 10].map((speed) => (
            <option key={speed} value={speed}>{speed}x</option>
          ))}
        </select>
      </div>

      {/* Comparison Mode */}
      <div className="flex items-center gap-2 ml-4 border-l border-line pl-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={false}
            onChange={() => { /* setComparisonMode(!comparisonMode); */ }}
            className="w-4 h-4 rounded border-line text-brand-300 focus:ring-brand-500"
          />
          <span className="text-sm text-ink-muted">Compare</span>
        </label>
      </div>

      {/* Voice Control */}
      <button
        className="ml-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Voice control"
      >
        <Mic className="w-5 h-5" />
      </button>
    </div>
  );
}