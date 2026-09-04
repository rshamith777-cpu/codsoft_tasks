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
    <div className="space-y-10">
      {/* Consistent Spacious Internal Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            05 // RULE INTELLIGENCE
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
            SECURITY <span className="font-serif-italic font-normal">SIGNATURES</span>
            <span className="font-press-start text-[9px] px-3.5 py-1 rounded-lg uppercase bg-white/10 text-white/90 border border-white/15">
              {rules.length} ACTIVE
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Deterministic AST pattern checkers, taint analysis rules, and remediation formulas.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono">
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">ACTIVE SIGNATURES</div>
            <div className="text-white/90 font-bold mt-0.5">{rules.length} Rules Loaded</div>
          </div>
          <div className="text-right hidden sm:block p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">TARGET ENGINES</div>
            <div className="text-white/90 font-bold mt-0.5">Python, TS, Go, PHP, Docker</div>
          </div>
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">TAXONOMY</div>
            <div className="text-[#85D743] font-bold mt-0.5">CWE / OWASP 2021</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
        {/* Language Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono">
          {['ALL', 'python', 'javascript', 'go', 'php', 'dockerfile', 'generic'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2.5 rounded-xl uppercase transition-all cursor-pointer font-semibold ${
                selectedLanguage === lang
                  ? 'bg-white/20 border border-white/40 text-white font-bold shadow-md'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH SIGNATURES..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#85D743]/50 transition-colors"
          />
        </div>
      </div>

      {/* Rules Registry List */}
      {loading ? (
        <div className="panel-surface p-16 text-center text-sm font-mono text-[#9a9a9a] rounded-2xl">
          Loading active security rules catalog...
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="panel-surface p-16 text-center text-sm font-mono text-[#9a9a9a] rounded-2xl">
          No security rules match your search query.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map((rule) => {
            const isExpanded = expandedRuleId === rule.id;
            const sevBadge = 
              rule.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
              rule.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
              rule.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
              'bg-blue-500/20 text-blue-300 border-blue-500/40';

            return (
              <div
                key={rule.id}
                className="panel-surface border border-white/15 rounded-2xl overflow-hidden transition-all shadow-lg hover:border-white/25"
              >
                <div
                  onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                  className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-[8px] font-press-start border ${sevBadge}`}>
                        {rule.severity}
                      </span>
                      <span className="text-sm font-mono text-white font-bold">
                        {rule.id}
                      </span>
                      <span className="text-xs font-mono text-[#85D743] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-bold">
                        {rule.cwe}
                      </span>
                      <span className="text-xs font-mono text-white/50 font-medium">
                        {rule.owasp}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {rule.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-white/80 uppercase text-xs font-semibold px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                      {rule.language}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-white/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/60" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-7 sm:p-8 border-t border-white/10 bg-black/60 space-y-6 text-sm">
                    <div>
                      <div className="font-press-start text-[8px] text-[#85D743] uppercase mb-2">RULE DEFINITION & SCOPE</div>
                      <p className="text-white/80 font-sans text-sm sm:text-base leading-relaxed">{rule.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="font-press-start text-[8px] text-rose-300 uppercase mb-2">VULNERABILITY PATTERN / TAINT SINK</div>
                        <pre className="p-4 rounded-xl bg-black/80 border border-white/15 font-mono text-xs sm:text-sm text-rose-300 whitespace-pre-wrap break-all shadow-inner">
                          {rule.pattern}
                        </pre>
                      </div>

                      <div>
                        <div className="font-press-start text-[8px] text-emerald-300 uppercase mb-2">REMEDIATION DIRECTIVE</div>
                        <p className="text-white/80 font-sans text-xs sm:text-sm leading-relaxed">{rule.remediation}</p>
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
