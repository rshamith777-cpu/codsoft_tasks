import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Printer, 
  Upload, 
  Play, 
  Trash2, 
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Packet, ThreatAlert, CaptureStats, SavedSession, CaptureMode } from '../types';
import { PageHeader } from './common/PageHeader';

interface ReportsViewProps {
  stats: CaptureStats;
  packets: Packet[];
  alerts: ThreatAlert[];
  captureMode?: CaptureMode;
  onExport: (format: 'csv' | 'json' | 'txt') => void;
  sessions?: SavedSession[];
  onLoadSession?: (session: SavedSession) => void;
  onDeleteSession?: (id: string) => void;
  onImportPcap?: (file: File) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  stats, 
  packets, 
  alerts, 
  captureMode = 'IDLE',
  onExport,
  sessions = [],
  onLoadSession,
  onDeleteSession,
  onImportPcap
}) => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleGeneratePdfReport = () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('SOVEREIGN NETWORK PACKET AUDIT REPORT', 14, 20);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Forensic Cyber Security Inspection - Comprehensive Network Traffic & Threat Telemetry Summary', 14, 26);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 31);

      doc.setLineWidth(0.5);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 35, 196, 35);

      // Section 1: Executive Summary
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Executive Traffic Telemetry Summary', 14, 45);

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Frames Captured: ${stats.totalPackets}`, 14, 53);
      doc.text(`TCP Packets: ${stats.tcpCount} (${((stats.tcpCount / Math.max(stats.totalPackets, 1)) * 100).toFixed(1)}%)`, 14, 59);
      doc.text(`UDP Datagrams: ${stats.udpCount} (${((stats.udpCount / Math.max(stats.totalPackets, 1)) * 100).toFixed(1)}%)`, 14, 65);
      doc.text(`ICMP Control Frames: ${stats.icmpCount}`, 14, 71);
      doc.text(`Security Intrusion Alerts Flagged: ${alerts.length}`, 14, 77);

      // Section 2: Threat Incidents
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text('2. Flagged Security Incidents & Threat Signatures', 14, 90);

      let yPos = 98;
      if (alerts.length === 0) {
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text('Zero security intrusions or abnormal heuristic vectors identified during session.', 14, yPos);
        yPos += 16;
      } else {
        alerts.forEach((alt) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont('times', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(225, 29, 72);
          doc.text(`[${alt.severity}] ${alt.alertType} - ${alt.timestamp}`, 14, yPos);

          doc.setFont('times', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(`Description: ${alt.description}`, 18, yPos + 6);
          doc.text(`Source Host: ${alt.sourceIp} | MITRE ATT&CK: ${alt.mitreTechnique || 'T1046'}`, 18, yPos + 12);
          yPos += 20;
        });
      }

      // Section 3: Recommendations
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Remediation & Firewall Posture Adjustments', 14, yPos);

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text('1. Block suspicious ingress connections from flagged external IP blocks.', 18, yPos + 8);
      doc.text('2. Rate-limit ICMP echo requests to mitigate distributed denial-of-service vectors.', 18, yPos + 14);
      doc.text('3. Enforce strict TLS 1.3 cryptographic cipher suites across perimeter gateways.', 18, yPos + 20);

      doc.save(`Sovereign_Network_Audit_${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onImportPcap) {
      onImportPcap(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onImportPcap) {
      onImportPcap(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-ui">
      
      {/* 06 / Page Title Header */}
      <PageHeader
        number="06"
        category="ARTIFACTS & PCAP VAULT"
        title="REPORTS & VAULT"
        description="Generate auditable forensic reports, export multi-format packet captures, and manage saved PCAP sessions."
        captureMode={captureMode}
      >
        <button
          onClick={handleGeneratePdfReport}
          disabled={generatingPdf}
          className="px-5 py-2.5 rounded-full bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-mono shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>{generatingPdf ? 'Compiling PDF...' : 'Generate Executive Audit PDF'}</span>
        </button>
      </PageHeader>

      {/* EXPORT FORMATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CSV */}
        <div className="sovereign-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">CSV Stream</span>
              <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-xs text-white/60 font-mono">Tabular packet records formatted for Excel, Pandas, or Splunk ingestion.</p>
          </div>
          <button
            onClick={() => onExport('csv')}
            disabled={packets.length === 0}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-medium rounded-full border border-white/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Download CSV ({packets.length} rows)</span>
          </button>
        </div>

        {/* JSON */}
        <div className="sovereign-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">JSON Hierarchical</span>
              <FileCode className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <p className="text-xs text-white/60 font-mono">Full tree decapsulation schema with bitwise flags and hex dumps.</p>
          </div>
          <button
            onClick={() => onExport('json')}
            disabled={packets.length === 0}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-medium rounded-full border border-white/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Download JSON Object</span>
          </button>
        </div>

        {/* Plain Text */}
        <div className="sovereign-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Forensic Text Log</span>
              <FileText className="w-4 h-4 text-white/80" />
            </div>
            <p className="text-xs text-white/60 font-mono">Standard ASCII summary stream formatted for terminal review.</p>
          </div>
          <button
            onClick={() => onExport('txt')}
            disabled={packets.length === 0}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-medium rounded-full border border-white/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-white/70" />
            <span>Download Raw TXT Log</span>
          </button>
        </div>

      </div>

      {/* PCAP INGESTION & DROPZONE */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`sovereign-panel p-8 text-center border-dashed transition-all ${
          dragOver ? 'border-white bg-white/10' : 'border-white/20'
        }`}
      >
        <Upload className="w-8 h-8 text-white/80 mx-auto mb-2 opacity-80" />
        <h3 className="text-sm font-semibold text-white font-mono uppercase">
          Import External PCAP / PCAPNG File
        </h3>
        <p className="text-xs text-white/60 max-w-md mx-auto mt-1 font-mono">
          Drag and drop a Wireshark or tcpdump `.pcap` capture file, or select one manually to parse binary packet frames.
        </p>

        <label className="inline-block mt-4 px-5 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold font-mono rounded-full cursor-pointer transition-all backdrop-blur-md">
          <span>Select PCAP File from Disk</span>
          <input
            type="file"
            accept=".pcap,.pcapng,.cap,.json,.csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* SAVED PCAP VAULT SESSIONS */}
      <div className="sovereign-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Saved Session Vault
            </h3>
            <p className="text-[11px] text-white/50 font-mono mt-0.5">Historical ring buffer snapshots saved to browser persistent storage</p>
          </div>
          <span className="text-[10px] font-mono text-white/50">{sessions.length} SESSIONS</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/50 font-mono">
            No saved sessions found in vault. Use the "Save Session" button on the Overview or Live Capture screen to archive snapshots.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] font-mono text-xs">
            {sessions.map((sess) => (
              <div key={sess.id} className="py-3 flex items-center justify-between hover:bg-white/[0.03] px-3 rounded-xl transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{sess.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60">
                      {sess.packetCount || sess.packets?.length || 0} Packets
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">{sess.timestamp} • Interface: {sess.interfaceName || 'eth0'}</p>
                </div>

                <div className="flex items-center gap-2">
                  {onLoadSession && (
                    <button
                      onClick={() => onLoadSession(sess)}
                      className="px-3.5 py-1.5 bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/30 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Replay Ingest</span>
                    </button>
                  )}
                  {onDeleteSession && (
                    <button
                      onClick={() => onDeleteSession(sess.id)}
                      className="p-1.5 text-white/50 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-full transition-all cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
