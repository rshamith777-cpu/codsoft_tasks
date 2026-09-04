import React from 'react';

export type StatusType = 
  | 'LIVE' 
  | 'READY' 
  | 'HEALTHY' 
  | 'RESOLVED' 
  | 'STANDBY' 
  | 'PAUSED'
  | 'WARNING' 
  | 'MEDIUM' 
  | 'HIGH' 
  | 'CRITICAL' 
  | 'MALICIOUS'
  | 'SIMULATION'
  | 'DEMO'
  | 'NORMAL'
  | 'LOW';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  pulse = false
}) => {
  const norm = (status || '').toUpperCase();
  const text = label || norm;

  let colorClasses = 'bg-white/5 text-[#8e8e8e] border-white/10';
  let dotColor = 'bg-[#8e8e8e]';

  if (['LIVE', 'READY', 'HEALTHY', 'RESOLVED', 'ONLINE'].includes(norm)) {
    colorClasses = 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
    dotColor = 'bg-[#10B981]';
  } else if (['CRITICAL', 'HIGH', 'MALICIOUS', 'THREAT'].includes(norm)) {
    colorClasses = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
    dotColor = 'bg-[#EF4444]';
  } else if (['WARNING', 'MEDIUM', 'PAUSED', 'DEMO', 'DEMO MODE'].includes(norm)) {
    colorClasses = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
    dotColor = 'bg-[#F59E0B]';
  } else if (['SIMULATION'].includes(norm)) {
    colorClasses = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25';
    dotColor = 'bg-[#F59E0B]';
  } else if (['LOW', 'NORMAL', 'STANDBY'].includes(norm)) {
    colorClasses = 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';
    dotColor = 'bg-[#3B82F6]';
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px]' 
    : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold border ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'animate-pulse' : ''}`} />
      <span className="tracking-wider">{text}</span>
    </span>
  );
};
