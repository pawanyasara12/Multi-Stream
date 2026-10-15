import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, RefreshCw, Key, Globe, HelpCircle } from 'lucide-react';
import { IngestConfig } from '../types/stream';

interface ObsIngestCardProps {
  ingest: IngestConfig;
  onRegenerateKey: () => void;
  onOpenGuide: () => void;
  onUpdateRegion: (region: string) => void;
}

export const ObsIngestCard: React.FC<ObsIngestCardProps> = ({
  ingest,
  onRegenerateKey,
  onOpenGuide,
  onUpdateRegion,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmingRegen, setIsConfirmingRegen] = useState(false);

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
            Paste these credentials into OBS Studio under <strong className="text-slate-300">Settings &gt; Stream &gt; Custom</strong>.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Server URL */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Server (RTMP URL)</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={ingest.region}
                onChange={(e) => onUpdateRegion(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="us-east (Auto-Detected)">us-east (Auto-Detected)</option>
                <option value="us-west (Oregon)">us-west (Oregon)</option>
                <option value="eu-central (Frankfurt)">eu-central (Frankfurt)</option>
                <option value="ap-southeast (Singapore)">ap-southeast (Singapore)</option>
                <option value="localhost:1935">Localhost (127.0.0.1:1935)</option>
              </select>
            </div>
          </div>
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
