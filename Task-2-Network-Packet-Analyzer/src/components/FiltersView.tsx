import React, { useState } from 'react';
import { Filter, Plus, Trash2, SlidersHorizontal } from 'lucide-react';

interface FiltersViewProps {
  onApplyFilter: (filterStr: string) => void;
}

export const FiltersView: React.FC<FiltersViewProps> = ({ onApplyFilter }) => {
  const [bpfString, setBpfString] = useState('tcp.port == 443');
  const [savedFilters, setSavedFilters] = useState([
    { name: 'HTTPS Traffic Only', query: 'tcp.port == 443' },
    { name: 'DNS Lookup Queries', query: 'udp.port == 53 or dns' },
    { name: 'Internal Subnet Traffic', query: 'ip.src == 192.168.1.0/24' },
    { name: 'ICMP Ping Traffic', query: 'icmp' },
    { name: 'Large Frames (>1000 bytes)', query: 'frame.len > 1000' },
  ]);

  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleQuery, setNewRuleQuery] = useState('');

  const handleAddFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRuleName && newRuleQuery) {
      setSavedFilters([...savedFilters, { name: newRuleName, query: newRuleQuery }]);
      setNewRuleName('');
      setNewRuleQuery('');
    }
  };

  const handleRemoveFilter = (index: number) => {
    setSavedFilters(savedFilters.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto font-sans-calm bg-[#0B0F17] min-h-full">
      
      {/* Top Banner */}
      <div className="calm-card p-4 rounded-xl space-y-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Berkeley Packet Filter (BPF) & Expression Builder
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Construct boolean packet capture and display expressions using standard syntax.
        </p>
      </div>

      {/* Active Expression Bar */}
      <div className="p-4 calm-card rounded-xl space-y-2.5">
        <label className="text-xs font-medium text-slate-300 block">
          Active Expression:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={bpfString}
            onChange={(e) => setBpfString(e.target.value)}
            placeholder="e.g. ip.src == 192.168.1.10 and tcp.port == 80"
            className="flex-1 bg-slate-900 text-slate-200 font-mono-calm text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
          <button
            onClick={() => onApplyFilter(bpfString)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Saved Filter Profiles */}
      <div className="p-4 calm-card rounded-xl space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-indigo-400" />
          Filter Presets
        </h3>

        <div className="space-y-2 font-mono-calm text-xs">
          {savedFilters.map((f, i) => (
            <div
              key={i}
              className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-200 font-sans-calm text-xs">{f.name}</p>
                <p className="text-indigo-400 font-mono-calm text-[11px] mt-0.5">{f.query}</p>
              </div>

              <div className="flex items-center gap-2 font-sans-calm">
                <button
                  onClick={() => {
                    setBpfString(f.query);
                    onApplyFilter(f.query);
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700/60 transition-colors text-xs font-medium cursor-pointer"
                >
                  Apply
                </button>
                <button
                  onClick={() => handleRemoveFilter(i)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Custom Filter Rule */}
      <form onSubmit={handleAddFilter} className="p-4 calm-card rounded-xl space-y-3">
        <h3 className="text-xs font-semibold text-slate-200">
          Add Custom Filter Rule
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-calm">
          <input
            type="text"
            placeholder="Name (e.g. SSH Traffic)"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-sans-calm"
          />
          <input
            type="text"
            placeholder="Expression (e.g. tcp.port == 22)"
            value={newRuleQuery}
            onChange={(e) => setNewRuleQuery(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono-calm"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Save Preset</span>
        </button>
      </form>

    </div>
  );
};
