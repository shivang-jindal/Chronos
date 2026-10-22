import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, Layers, Zap, Brain, Search, Settings, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, RotateCcw, Download, Share2, Mic, Maximize, Minimize, History, Zap as ZapIcon, Globe as GlobeIcon, Brain as BrainIcon, Layers as LayersIcon2, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from './Toast';
import { useChronosStore } from '../store/chronosStore';
import { TemporalControl } from './TemporalControl';
import { LayerPanel } from './LayerPanel';
import { AIChatPanel } from './AIChatPanel';
import { ShareModal } from './ShareModal';
import { ExportModal } from './ExportModal';
import { ScenarioBuilderModal } from './ScenarioBuilderModal';
import { ChangeDetectionModal } from './ChangeDetectionModal';
import { ForecastingModal } from './ForecastingModal';
import { AIChatModal } from './AIChatModal';
import { SettingsModal } from './SettingsModal';
import { HelpModal } from './HelpModal';

const NAV_ITEMS = [
  { to: '/globe', label: 'Globe', icon: GlobeIcon },
  { to: '/change-detection', label: 'Change Detection', icon: History },
  { to: '/forecasting', label: 'Forecasting', icon: ZapIcon },
  { to: '/scenario-builder', label: 'Scenario Builder', icon: BrainIcon },
  { to: '/ai-chat', label: 'AI Oracle', icon: BrainIcon },
  { to: '/data-explorer', label: 'Data Explorer', icon: LayersIcon2 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon }
];

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleVoiceToggle = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      addToast({ type: 'info', title: 'Voice Control Activated', message: 'Say "Hey Chronos" to start', duration: 3000 });
    } else {
      setVoiceActive(false);
      setVoiceListening(false);
      addToast({ type: 'info', title: 'Voice Control Deactivated' });
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setVoiceListening(true);
    // Process voice command through AI
    // This would connect to the AI chat backend
    setTimeout(() => setVoiceListening(false), 1000);
  };

  const openModal = (modal: string) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  const handleGlobeClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.cesium-widget')) {
      // Globe clicked - could show context menu
    }
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <a href="#main" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand-600 text-white rounded-lg">
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside className={`hidden w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 lg:flex transition-all duration-300 ${!sidebarOpen ? 'w-16' : ''}`}>
        {/* Brand */}
        <div className={`flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 ${!sidebarOpen ? 'justify-center' : ''}`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <GlobeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">Chronos</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5 p-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/globe'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  } group`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-slate-200 dark:border-slate-800 p-4 ${!sidebarOpen ? 'hidden' : ''}`}>
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Chronos v1.0.0 — 4D Temporal Earth Engine
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/globe'}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur px-4 py-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <TemporalControl />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Control */}
            <button
              onClick={handleVoiceToggle}
              className={`p-2 rounded-lg transition-all ${
                voiceActive
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 ring-2 ring-brand-500'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label={voiceActive ? 'Deactivate voice control' : 'Activate voice control'}
              aria-pressed={voiceActive}
            >
              {voiceListening ? (
                <Mic className="w-5 h-5 animate-pulse text-red-500" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Layer Panel Toggle */}
            <button
              onClick={() => openModal('layers')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Layers"
            >
              <LayersIcon2 className="w-5 h-5" />
            </button>

            {/* AI Chat Toggle */}
            <button
              onClick={() => openModal('ai-chat')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="AI Assistant"
            >
              <BrainIcon className="w-5 h-5" />
            </button>

            {/* Scenario Builder */}
            <button
              onClick={() => openModal('scenario-builder')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Scenario Builder"
            >
              <ZapIcon className="w-5 h-5" />
            </button>

            {/* Share */}
            <button
              onClick={() => openModal('share')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Export */}
            <button
              onClick={() => openModal('export')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Export"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Settings */}
            <button
              onClick={() => openModal('settings')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Help */}
            <button
              onClick={() => openModal('help')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main id="main" className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0" onClick={handleGlobeClick}>
            <Outlet />
          </div>

          {/* Side Panels */}
          {sidebarOpen && (
            <>
              <LayerPanel isOpen={true} onClose={() => setSidebarOpen(false)} />
              <AIChatPanel isOpen={false} onClose={() => {}} />
            </>
          )}

          {/* Modals */}
          {activeModal === 'layers' && <LayerPanel isOpen={true} onClose={closeModal} />}
          {activeModal === 'ai-chat' && <AIChatModal isOpen={true} onClose={closeModal} />}
          {activeModal === 'share' && <ShareModal isOpen={true} onClose={closeModal} />}
          {activeModal === 'export' && <ExportModal isOpen={true} onClose={closeModal} />}
          {activeModal === 'scenario-builder' && <ScenarioBuilderModal isOpen={true} onClose={closeModal} />}
          {activeModal === 'change-detection' && <ChangeDetectionModal isOpen={true} onClose={closeModal} />}
          {activeModal === 'forecasting' && <ForecastingModal isOpen={true} onClose={closeModal} />}
          {activeModal === 'ai-chat' && <AIChatModal isOpen={true} onClose={closeModal} />}
          {activeModal === 'settings' && <SettingsModal isOpen={true} onClose={closeModal} />}
          {activeModal === 'help' && <HelpModal isOpen={true} onClose={closeModal} />}
        </main>
      </div>
    </div>
  );
}