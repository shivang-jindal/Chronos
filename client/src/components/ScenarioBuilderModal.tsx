import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useToast } from './Toast';
import { SCENARIO_TYPES, SCENARIO_FORCINGS, POLICY_LEVERS } from '@chronos/shared';

export function ScenarioBuilderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('Carbon transition 2030');
  const [scenarioType, setScenarioType] = useState<string>(SCENARIO_TYPES[0]);
  const [forcing, setForcing] = useState<string>(SCENARIO_FORCINGS[0]);
  const [levers, setLevers] = useState<string[]>(['carbon_price']);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const toggleLever = (lever: string) => {
    setLevers((prev) => (prev.includes(lever) ? prev.filter((l) => l !== lever) : [...prev, lever]));
  };

  const handleCreate = () => {
    addToast({ type: 'success', title: 'Scenario Created', message: `"${name}" is ready to run` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Scenario Builder</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="scenario-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Scenario name</label>
            <input
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="scenario-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Scenario type</label>
            <select
              id="scenario-type"
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SCENARIO_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="scenario-forcing" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Climate forcing</label>
            <select
              id="scenario-forcing"
              value={forcing}
              onChange={(e) => setForcing(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SCENARIO_FORCINGS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Policy levers</legend>
            <div className="flex flex-wrap gap-2">
              {POLICY_LEVERS.map((lever) => {
                const active = levers.includes(lever);
                return (
                  <button
                    key={lever}
                    type="button"
                    onClick={() => toggleLever(lever)}
                    aria-pressed={active}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      active
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {lever.replace(/_/g, ' ')}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
            Create Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
