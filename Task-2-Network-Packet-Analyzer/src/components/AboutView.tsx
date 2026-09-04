import React from 'react';
import { Award, Code2, ShieldCheck, Activity } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto font-sans-calm bg-[#0B0F17] min-h-full">
      
      {/* Hero Banner */}
      <div className="p-7 calm-card rounded-2xl text-center space-y-3 relative overflow-hidden">
        <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Network Packet Analyzer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time Packet Inspection, Threat Telemetry & Protocol Analysis
          </p>
          <span className="mt-2.5 inline-block px-3 py-1 bg-slate-800 text-indigo-300 border border-slate-700/60 rounded-full text-xs font-medium font-mono-calm">
            CodSoft Cyber Security Project
          </span>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* Project Objectives */}
        <div className="p-4 calm-card rounded-xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" />
            Capabilities & Objectives
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Live promiscuous packet capture simulation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Layer 2–7 protocol dissection (TCP, UDP, ICMP, ARP, DNS, HTTP)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Automated port scan and flood heuristic detection</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Gemini AI security assistant for packet explanation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Interactive hex dump viewer and ASCII decoding</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Executive PDF reports, CSV data, and JSON exports</span>
            </li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="p-4 calm-card rounded-xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-sky-400" />
            Technology Architecture
          </h3>
          <div className="space-y-2 text-slate-300 font-mono-calm text-xs">
            <p><strong className="text-slate-400 font-sans-calm text-[11px]">Runtime:</strong> Node.js / Express TypeScript</p>
            <p><strong className="text-slate-400 font-sans-calm text-[11px]">Capture Engine:</strong> Virtual packet generation & frame decoding</p>
            <p><strong className="text-slate-400 font-sans-calm text-[11px]">AI Diagnostic:</strong> @google/genai (Gemini 2.5 Flash)</p>
            <p><strong className="text-slate-400 font-sans-calm text-[11px]">Frontend:</strong> React 19, Tailwind CSS v4, Recharts, Lucide</p>
            <p><strong className="text-slate-400 font-sans-calm text-[11px]">PDF Engine:</strong> jsPDF Generation Library</p>
          </div>
        </div>

      </div>

    </div>
  );
};
