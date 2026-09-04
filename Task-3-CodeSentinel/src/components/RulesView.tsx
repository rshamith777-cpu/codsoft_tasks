import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Code2, 
  ChevronDown, 
  ChevronUp,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { SecurityRule } from '../types.ts';

export const RulesView: React.FC = () => {
  const [rules, setRules] = useState<SecurityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/rules')
      .then(res => res.json())
      .then(data => {
        setRules(data.rules || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load rules:', err);
        setLoading(false);
      });
  }, []);

  const filteredRules = rules.filter(r => {
    if (selectedLanguage !== 'ALL' && r.language !== selectedLanguage && r.language !== 'generic') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.cwe.toLowerCase().includes(q) ||
        r.owasp.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Consistent Internal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">05 / RULE INTELLIGENCE</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            SECURITY <span className="font-serif-italic font-normal">SIGNATURES</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/10">
              {rules.length} ACTIVE
            </span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Deterministic AST pattern checkers, taint analysis rules, and remediation formulas.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="text-right">
            <div className="text-[#9a9a9a] text-[10px]">ACTIVE SIGNATURES</div>
            <div className="text-white/90">{rules.length} Rules Loaded</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[#9a9a9a] text-[10px]">SUPPORTED TARGETS</div>
            <div className="text-white/90">Python, TS, Go, PHP, Docker</div>
          </div>
          <div className="text-right">
            <div className="text-[#9a9a9a] text-[10px]">TAXONOMY</div>
            <div className="text-white/90">CWE / OWASP 2021</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        {/* Language Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['ALL', 'python', 'javascript', 'go', 'php', 'dockerfile', 'generic'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg border uppercase transition-all cursor-pointer ${
                selectedLanguage === lang
                  ? 'bg-white/15 border-white/30 text-white font-semibold'
                  : 'bg-white/5 border-white/10 text-[#9a9a9a] hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH SIGNATURES..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
          />
        </div>
      </div>

      {/* Rules Registry List */}
      {loading ? (
        <div className="panel-surface p-12 text-center text-xs font-mono text-[#9a9a9a]">
          Loading active security rules catalog...
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="panel-surface p-12 text-center text-xs font-mono text-[#9a9a9a]">
          No security rules match your search query.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRules.map((rule) => {
            const isExpanded = expandedRuleId === rule.id;
            const sevBadge = 
              rule.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
              rule.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
              rule.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
              'bg-blue-500/20 text-blue-300 border-blue-500/30';

            return (
              <div
                key={rule.id}
                className="panel-surface border border-white/10 overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${sevBadge}`}>
                        {rule.severity}
                      </span>
                      <span className="text-xs font-mono text-white/90 font-semibold">
                        {rule.id}
                      </span>
                      <span className="text-xs font-mono text-[#9a9a9a] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {rule.cwe}
                      </span>
                      <span className="text-xs font-mono text-white/40">
                        {rule.owasp}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      {rule.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-[#9a9a9a] uppercase text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      {rule.language}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-white/10 bg-black/40 space-y-4 text-xs">
                    <div>
                      <div className="text-[#9a9a9a] font-mono text-[10px] uppercase mb-1">RULE DEFINITION & SCOPE</div>
                      <p className="text-white/80 font-sans text-xs leading-relaxed">{rule.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-rose-400 font-mono text-[10px] uppercase mb-1">VULNERABILITY PATTERN / TAINT SINK</div>
                        <pre className="p-3 rounded-lg bg-black/70 border border-white/10 font-mono text-[11px] text-rose-300 whitespace-pre-wrap break-all">
                          {rule.pattern}
                        </pre>
                      </div>

                      <div>
                        <div className="text-emerald-400 font-mono text-[10px] uppercase mb-1">REMEDIATION DIRECTIVE</div>
                        <p className="text-white/80 font-sans text-xs leading-relaxed">{rule.remediation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
