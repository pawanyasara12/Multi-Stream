import React, { useState } from 'react';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Key,
  Globe,
  HelpCircle,
  AlertTriangle,
  Download,
  Terminal
} from 'lucide-react';
import { IngestConfig, Destination } from '../types/stream';

interface ObsIngestCardProps {
  ingest: IngestConfig;
  destinations: Destination[];
  onRegenerateKey: () => void;
  onOpenGuide: () => void;
  onUpdateServerUrl: (url: string) => void;
}

export const ObsIngestCard: React.FC<ObsIngestCardProps> = ({
  ingest,
  destinations,
  onRegenerateKey,
  onOpenGuide,
  onUpdateServerUrl,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmingRegen, setIsConfirmingRegen] = useState(false);
  const [isEditingServer, setIsEditingServer] = useState(false);
  const [serverInput, setServerInput] = useState(ingest.serverUrl);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegen = () => {
    if (!isConfirmingRegen) {
      setIsConfirmingRegen(true);
      setTimeout(() => setIsConfirmingRegen(false), 5000);
    } else {
      onRegenerateKey();
      setIsConfirmingRegen(false);
    }
  };

  const handleSaveServer = () => {
    onUpdateServerUrl(serverInput.trim() || 'rtmp://127.0.0.1:1935/live');
    setIsEditingServer(false);
  };

  const downloadLocalRelayScript = () => {
    const enabledDests = destinations.filter((d) => d.enabled && d.streamKey);
    const outputs = enabledDests
      .map((d) => {
        const fullUrl = d.serverUrl.endsWith('/')
          ? `${d.serverUrl}${d.streamKey}`
          : `${d.serverUrl}/${d.streamKey}`;
        return `-c:v copy -c:a copy -f flv "${fullUrl}"`;
      })
      .join(' ');

    const batContent = `@echo off
title StreamForge Multistream Relay
echo ========================================================
echo   StreamForge Local RTMP Multistream Relay Engine
echo   Relaying OBS to Twitch, YouTube, and Kick
echo ========================================================
echo.
echo Checking for ffmpeg...
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] FFmpeg is not installed or not in your PATH.
    echo Please download ffmpeg from https://ffmpeg.org/download.html or install via:
    echo   winget install Gyan.FFmpeg
    pause
    exit /b
)

echo Starting RTMP listener on rtmp://127.0.0.1:1935/live/${ingest.streamKey}
echo Point OBS Studio Server to: rtmp://127.0.0.1:1935/live
echo Point OBS Studio Stream Key to: ${ingest.streamKey}
echo.
echo Press Ctrl+C in this window to stop relaying.
echo.

ffmpeg -listen 1 -i "rtmp://0.0.0.0:1935/live/${ingest.streamKey}" ${outputs}
pause
`;

    const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'start-multistream-relay.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-72 h-32 bg-indigo-600/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight">
              OBS Studio Ingest Credentials
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              RTMP Port 1935
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure OBS under <strong className="text-slate-300">Settings &gt; Stream &gt; Custom</strong>.
          </p>
        </div>

        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors w-fit"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>OBS Setup Instructions</span>
        </button>
      </div>

      {/* Host Name Not Found Warning Banner */}
      <div className="mb-4 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">
              Got &quot;Host name not found&quot; in OBS?
            </span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              OBS throws this error if a domain has no DNS. Use <strong className="text-white font-mono">rtmp://127.0.0.1:1935/live</strong> for your local machine, or use the free <strong className="text-indigo-300">OBS Multi-RTMP Plugin</strong> to stream directly from OBS!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              onUpdateServerUrl('rtmp://127.0.0.1:1935/live');
              setServerInput('rtmp://127.0.0.1:1935/live');
            }}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition-colors whitespace-nowrap"
          >
            Use 127.0.0.1
          </button>
          <button
            onClick={downloadLocalRelayScript}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors whitespace-nowrap"
            title="Download ready-to-run batch file that starts local RTMP relay with your keys"
          >
            <Download className="w-3 h-3" />
            <span>1-Click Relay (.bat)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Server URL */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Server (RTMP URL)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onUpdateServerUrl('rtmp://127.0.0.1:1935/live');
                  setServerInput('rtmp://127.0.0.1:1935/live');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline"
              >
                Localhost
              </button>
              <span className="text-slate-600">·</span>
              <button
                type="button"
                onClick={() => setIsEditingServer(!isEditingServer)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300"
              >
                {isEditingServer ? 'Done' : 'Edit IP'}
              </button>
            </div>
          </div>

          {isEditingServer ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={serverInput}
                onChange={(e) => setServerInput(e.target.value)}
                placeholder="rtmp://127.0.0.1:1935/live"
                className="bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 w-full rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSaveServer}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded shrink-0"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center rounded-lg bg-slate-950/80 border border-slate-800 p-1 pl-3 focus-within:border-indigo-500 transition-colors">
              <input
                type="text"
                readOnly
                value={ingest.serverUrl}
                className="bg-transparent text-xs font-mono text-slate-200 w-full focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(ingest.serverUrl, 'server')}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Copy Server URL"
              >
                {copiedField === 'server' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Stream Key */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Stream Key</span>
            </label>
            <button
              onClick={handleRegen}
              className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                isConfirmingRegen
                  ? 'text-rose-400 hover:text-rose-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Regenerate Stream Key"
            >
              <RefreshCw className={`w-3 h-3 ${isConfirmingRegen ? 'animate-spin' : ''}`} />
              <span>{isConfirmingRegen ? 'Confirm Reset Key?' : 'Regenerate'}</span>
            </button>
          </div>

          <div className="flex items-center rounded-lg bg-slate-950/80 border border-slate-800 p-1 pl-3 focus-within:border-indigo-500 transition-colors">
            <input
              type={showKey ? 'text' : 'password'}
              readOnly
              value={ingest.streamKey}
              className="bg-transparent text-xs font-mono text-slate-200 w-full focus:outline-none tracking-wider"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(ingest.streamKey, 'key')}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Copy Stream Key"
            >
              {copiedField === 'key' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recommended specs strip */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span>Optimal OBS Settings:</span>
        <span className="text-slate-300 font-mono">1080p @ 60 FPS</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-slate-300 font-mono">CBR 6,000–8,000 Kbps</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-slate-300 font-mono">Keyframe 2.0s</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-slate-300 font-mono">AAC Audio 160 Kbps</span>
      </div>
    </div>
  );
};
