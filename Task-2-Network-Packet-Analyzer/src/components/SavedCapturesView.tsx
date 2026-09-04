import React, { useState } from 'react';
import { Upload, Play, Trash2, HardDrive, FileCheck } from 'lucide-react';
import { SavedSession } from '../types';

interface SavedCapturesViewProps {
  sessions: SavedSession[];
  onLoadSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
  onImportPcap: (file: File) => void;
}

export const SavedCapturesView: React.FC<SavedCapturesViewProps> = ({
  sessions,
  onLoadSession,
  onDeleteSession,
  onImportPcap
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportPcap(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImportPcap(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans-calm bg-transparent min-h-full">
      
      {/* Header */}
      <div className="calm-card p-4 rounded-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Archived Captures & PCAP Files
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Store, reload, and inspect saved packet traces and session captures.
          </p>
        </div>
      </div>

      {/* PCAP Drag and Drop Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`p-7 border border-dashed rounded-xl text-center transition-colors ${
          dragOver 
            ? 'border-indigo-500 bg-indigo-950/20' 
            : 'border-slate-800 calm-card hover:border-slate-700'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
        <h3 className="font-semibold text-sm text-slate-200">
          Import PCAP or JSON Capture
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Drag and drop your network traffic capture file here or select from disk
        </p>

        <label className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm cursor-pointer transition-colors">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Browse Files</span>
          <input type="file" accept=".pcap,.pcapng,.json" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {/* Saved Sessions Table */}
      <div className="calm-card rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200">
          Saved Capture Sessions ({sessions.length})
        </h3>

        <div className="space-y-2 font-mono-calm text-xs">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <p className="font-medium text-slate-200 text-xs flex items-center gap-1.5 font-sans-calm">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  {s.fileName}
                </p>
                <div className="flex items-center gap-2.5 text-slate-400 text-[11px]">
                  <span>{s.date}</span>
                  <span>•</span>
                  <span>{s.duration}</span>
                  <span>•</span>
                  <span className="text-slate-300">{s.packetsCount.toLocaleString()} pkts</span>
                  <span>•</span>
                  <span className="text-emerald-400">{s.fileSize}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-sans-calm">
                <button
                  onClick={() => onLoadSession(s)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current text-indigo-400" />
                  <span>Load Session</span>
                </button>

                <button
                  onClick={() => onDeleteSession(s.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
