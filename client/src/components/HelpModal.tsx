import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal, Trash2, Download, Edit, Copy, Sparkles, MessageSquare, Mic, Volume2, VolumeX, Brain, Zap, Layers, Globe, History, Settings, HelpCircle, Camera, Video, Image, FileText, Map, Share2, Keyboard, Github, AlertCircle, Download as DownloadIcon, Copy as CopyIcon, Trash2 as Trash2Icon, Layers as LayersIcon, Download as DownloadIcon2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<'getting-started' | 'keyboard-shortcuts' | 'layers-guide' | 'ai-guide' | 'scenarios' | 'export' | 'faq'>('getting-started');

  const tabs = [
    { id: 'getting-started', label: 'Getting Started', icon: Globe },
    { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
    { id: 'layers-guide', label: 'Layers Guide', icon: Layers },
    { id: 'ai-guide', label: 'AI Assistant', icon: Brain },
    { id: 'scenarios', label: 'Scenarios', icon: Zap },
    { id: 'export', label: 'Export & Share', icon: Share2 },
    { id: 'faq', label: 'FAQ', icon: HelpCircle }
  ] as const;

  const shortcuts = [
    { keys: ['1', '7'], action: 'Switch visualization styles' },
    { keys: ['H'], action: 'Toggle HUD' },
    { keys: ['D'], action: 'Toggle detection overlay' },
    { keys: ['C'], action: 'Enter/exit cockpit mode' },
    { keys: ['`'], action: 'Show frame rate' },
    { keys: ['Esc'], action: 'Close modal/panel' },
    { keys: ['Space'], action: 'Play/pause animation' },
    { keys: ['←/→'], action: 'Step through time' },
    { keys: ['Shift+←/→'], action: 'Step by 10 years' },
    { keys: ['+/-'], action: 'Zoom in/out' },
    { keys: ['R'], action: 'Reset globe view' },
    { keys: ['F'], action: 'Toggle fullscreen' },
    { keys: ['S'], action: 'Open share modal' },
    { keys: ['E'], action: 'Open export modal' },
    { keys: ['L'], action: 'Toggle layers panel' },
    { keys: ['A'], action: 'Open AI chat' },
    { keys: ['M'], action: 'Open scenario builder' },
    { keys: ['H'], action: 'Open help' }
  ];

  const faqs = [
    {
      q: 'What data sources does Chronos use?',
      a: 'Chronos uses open satellite data from Landsat (1984-present), Sentinel-2, Planet NICFI, night lights (DMSP/VIIRS), and climate data from NOAA/NASA. All sources are free and open.'
    },
    {
      q: 'Can I use my own data?',
      a: 'Yes! You can upload GeoTIFF/COG files, GeoJSON, or connect to STAC APIs. See the Data Explorer for upload options.'
    },
    {
      q: 'How accurate are the forecasts?',
      a: 'Forecasts use ensemble modeling with confidence intervals. Accuracy varies by layer and region - see confidence intervals in forecast results.'
    },
    {
      q: 'Can I use Chronos offline?',
      a: 'Chronos requires internet for live data and AI features. You can export data for offline use via the Export panel.'
    },
    {
      q: 'Is my data private?',
      a: 'Yes. Your data, scenarios, and API keys never leave your browser unless you explicitly share them. See our Privacy Policy.'
    },
    {
      q: 'How do I report a bug?',
      a: 'Use the feedback button in the help menu, or open an issue on GitHub at github.com/shivang-jindal/Chronos/issues'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Help & Documentation</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[calc(100vh-200px)]">
          {activeTab === 'getting-started' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Welcome to Chronos</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Chronos is a 4D temporal Earth engine that lets you explore 40+ years of planetary change on a photorealistic 3D globe.
                  Travel through time from 1984 to 2050, detect changes, forecast futures, and build scenarios.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: '1. Explore the Globe', desc: 'Use mouse/touch to navigate. Scroll to zoom, drag to pan, shift+drag to tilt.' },
                    { title: '2. Travel Through Time', desc: 'Use the timeline at the top to scrub through 1984-2050. Press Space to play.' },
                    { title: '3. Switch Layers', desc: 'Open the Layers panel (L) to toggle satellite imagery, night lights, urban extent, and more.' },
                    { title: '4. Detect Changes', desc: 'Open Change Detection (Ctrl+D) to find deforestation, urban growth, water changes, and more.' },
                    { title: '5. Forecast the Future', desc: 'Use the Forecasting panel to predict future changes with AI models.' },
                    { title: '6. Build Scenarios', desc: 'Create what-if scenarios with policy levers and climate models.' }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border-l-4 border-brand-500">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Controls</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    ['1-7', 'Visualization styles'],
                    ['H', 'Toggle HUD'],
                    ['D', 'Detection overlay'],
                    ['C', 'Cockpit mode'],
                    ['Space', 'Play/pause'],
                    ['Esc', 'Close modal'],
                    ['←/→', 'Step time'],
                    ['Shift+←/→', 'Step 10 years'],
                    ['+/-', 'Zoom'],
                    ['R', 'Reset view'],
                    ['F', 'Fullscreen'],
                    ['L', 'Layers panel'],
                    ['A', 'AI chat'],
                    ['M', 'Scenario builder'],
                    ['S', 'Share'],
                    ['E', 'Export'],
                    ['?', 'Help']
                  ].map(([keys, action]) => (
                    <div key={action} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                      <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">{keys}</kbd>
                      <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keyboard-shortcuts' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-2">
                {[
                  { category: 'Navigation', shortcuts: [
                    { keys: 'Mouse drag', action: 'Pan globe' },
                    { keys: 'Scroll / Pinch', action: 'Zoom in/out' },
                    { keys: 'Shift + Drag', action: 'Tilt/rotate view' },
                    { keys: 'R', action: 'Reset view to globe' },
                    { keys: 'F', action: 'Toggle fullscreen' }
                  ]},
                  { category: 'Time Control', shortcuts: [
                    { keys: 'Space', action: 'Play/pause animation' },
                    { keys: '← / →', action: 'Step back/forward 1 step' },
                    { keys: 'Shift + ← / →', action: 'Step back/forward 10 years' },
                    { keys: '1-7', action: 'Switch visualization style' },
                    { keys: '`', action: 'Show FPS counter' }
                  ]},
                  { category: 'UI Panels', shortcuts: [
                    { keys: 'L', action: 'Toggle layers panel' },
                    { keys: 'A', action: 'Open AI chat' },
                    { keys: 'M', action: 'Open scenario builder' },
                    { keys: 'S', action: 'Open share modal' },
                    { keys: 'E', action: 'Open export modal' },
                    { keys: 'H / ?', action: 'Open help' }
                  ]},
                  { category: 'Time Control', shortcuts: [
                    { keys: 'Space', action: 'Play/pause' },
                    { keys: '← / →', action: 'Step time' },
                    { keys: 'Shift + ← / →', action: 'Step 10 years' },
                    { keys: 'R', action: 'Reset to present' }
                  ]}
                ].map((cat) => (
                  <div key={cat.category} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{cat.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cat.shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                          <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">{s.keys}</kbd>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{s.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="group bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <summary className="p-4 cursor-pointer list-none flex items-center justify-between">
                      <span className="font-medium text-slate-900 dark:text-white">{faq.q}</span>
                      <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4 text-slate-600 dark:text-slate-400">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              <a href="https://github.com/shivang-jindal/Chronos" target="_blank" className="px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repository
              </a>
              <a href="https://github.com/shivang-jindal/Chronos/issues" target="_blank" className="px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Report Issue
              </a>
              <a href="https://github.com/shivang-jindal/Chronos/discussions" target="_blank" className="px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussions
              </a>
              <a href="https://discord.gg/chronos-earth" target="_blank" className="px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}