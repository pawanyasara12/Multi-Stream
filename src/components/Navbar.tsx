import React from 'react';
import { Radio, Activity, Download, Play, Square } from 'lucide-react';
import { IngestConfig, Destination } from '../types/stream';

interface NavbarProps {
  ingest: IngestConfig;
  destinations: Destination[];
  activeTab: 'studio' | 'setup' | 'chat' | 'engine' | 'diagnostics';
  setActiveTab: (tab: 'studio' | 'setup' | 'chat' | 'engine' | 'diagnostics') => void;
  onToggleSimulate: () => void;
  onOpenExporter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  ingest,
  destinations,
  activeTab,
  setActiveTab,
  onToggleSimulate,
  onOpenExporter,
}) => {
  const activeDestsCount = destinations.filter((d) => d.enabled).length;
  const isStreaming = ingest.status === 'relaying';

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d131f]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                StreamForge
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Multistream
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Relay Studio
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'setup'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            OBS Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Unified Chat & Overlay
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'engine'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            FFmpeg & Docker Exporter
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'diagnostics'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Bandwidth Savings
          </button>
        </nav>

        {/* Zone 3: Primary Action & Live Telemetry */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-white">
              {isStreaming ? 'STREAM LIVE' : 'INGEST READY'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-mono tabular-nums text-slate-400">
              {isStreaming ? formatUptime(ingest.uptimeSeconds) : 'OBS Idle'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-indigo-400 font-medium">
              {activeDestsCount} targets
            </span>
          </div>

          <button
            onClick={onToggleSimulate}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shadow-sm ${
              isStreaming
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Test Stream</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
