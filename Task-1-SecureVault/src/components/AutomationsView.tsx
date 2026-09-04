import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Zap,
} from 'lucide-react';
import { AutomationItem } from '../types';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { SeverityBadge } from './ui/Badges';
import { useToast } from './ui/Toast';

interface AutomationsViewProps {
  onRefresh: () => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({ onRefresh }) => {
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const data = await api.getAutomations();
      setAutomations(data);
    } catch (err: any) {
      console.error('Failed to load automations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleRunAutomation = async (autoId: string) => {
    setRunningId(autoId);
    try {
      const res = await api.runAutomation(autoId);
      showToast({
        type: 'success',
        title: 'AUTOMATION TRIGGERED',
        message: res.message || `${autoId} evaluated against vault storage.`,
      });
      fetchAutomations();
      onRefresh();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'EXECUTION FAILED',
        message: err.message,
      });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="font-mono-tech text-[10px] text-white/50 tracking-[0.16em] uppercase">
            ORCHESTRATED DEFENSE PIPELINES
          </div>
          <h2 className="font-sans-main text-lg sm:text-xl font-normal text-white mt-0.5">
            Deterministic Security Automations (AUTO-001 — AUTO-010)
          </h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />}
          onClick={fetchAutomations}
        >
          Sync Pipelines
        </Button>
      </div>

      {/* Automations Table / List */}
      <div className="glass-panel rounded-[2px] divide-y divide-white/5 overflow-hidden">
        {loading && (automations ?? []).length === 0 ? (
          <div className="p-8 text-center font-mono-tech text-xs text-white/40">
            [ QUERYING DETERMINISTIC AUTOMATION ENCLAVE... ]
          </div>
        ) : (
          (automations ?? []).map((item) => {
            const isRunning = runningId === item.id;
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono-tech font-bold text-xs tracking-wider text-white">
                      {item.id}
                    </span>
                    <span className="font-sans-main text-sm text-white font-medium">
                      {item.name}
                    </span>
                    <SeverityBadge severity={item.severity} />
                    <span
                      className={`px-2 py-0.5 font-mono-tech text-[9px] uppercase tracking-wider rounded-[2px] border ${
                        item.state === 'ACTIVE'
                          ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                          : item.state === 'RUNNING'
                          ? 'border-sky-500/35 bg-sky-500/10 text-sky-300'
                          : item.state === 'AWAITING APPROVAL'
                          ? 'border-amber-500/35 bg-amber-500/10 text-amber-300'
                          : 'border-white/15 bg-white/5 text-white/50'
                      }`}
                    >
                      {item.state}
                    </span>
                  </div>

                  <div className="font-mono-tech text-[11px] text-white/50">
                    <span className="text-white/40">Trigger:</span> {item.trigger}
                  </div>

                  <div className="font-sans-main text-xs text-white/70">
                    {item.actionSummary}
                  </div>

                  <div className="font-mono-tech text-[10px] text-white/40 pt-1 flex items-center gap-3 flex-wrap">
                    <span>Evidence: {item.evidence}</span>
                    <span>•</span>
                    <span>Outcome: {item.outcome}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Zap className="w-3 h-3" />}
                    onClick={() => handleRunAutomation(item.id)}
                    isLoading={isRunning}
                  >
                    Evaluate Trigger
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
