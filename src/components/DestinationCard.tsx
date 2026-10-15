import React, { useState } from 'react';
import {
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  Activity,
  Trash2,
  Tv,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Destination } from '../types/stream';

interface DestinationCardProps {
  destination: Destination;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Destination>) => void;
  onDelete?: (id: string) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [keyInput, setKeyInput] = useState(destination.streamKey);
  const [urlInput, setUrlInput] = useState(destination.serverUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdate(destination.id, {
      streamKey: keyInput.trim(),
      serverUrl: urlInput.trim(),
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const getPlatformTheme = () => {
    switch (destination.platform) {
      case 'twitch':
        return {
          border: 'border-purple-500/30 hover:border-purple-500/60',
          accent: 'text-[#a970ff]',
          bgLight: 'bg-[#9146FF]/10',
          badgeText: 'Twitch',
          dashUrl: 'https://dashboard.twitch.tv/settings/stream',
          iconBg: 'bg-[#9146FF]',
        };
      case 'youtube':
        return {
          border: 'border-red-500/30 hover:border-red-500/60',
          accent: 'text-red-400',
          bgLight: 'bg-red-500/10',
          badgeText: 'YouTube Live',
          dashUrl: 'https://studio.youtube.com/channel/live',
          iconBg: 'bg-red-600',
        };
      case 'kick':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/60',
          accent: 'text-[#53FC18]',
          bgLight: 'bg-[#53FC18]/10',
          badgeText: 'Kick.com',
          dashUrl: 'https://kick.com/dashboard/settings/stream',
          iconBg: 'bg-emerald-600',
        };
      case 'facebook':
        return {
          border: 'border-blue-500/30 hover:border-blue-500/60',
          accent: 'text-blue-400',
          bgLight: 'bg-blue-500/10',
          badgeText: 'Facebook Gaming',
          dashUrl: 'https://www.facebook.com/gaming/streamer',
          iconBg: 'bg-blue-600',
        };
      case 'tiktok':
        return {
          border: 'border-cyan-500/30 hover:border-cyan-500/60',
          accent: 'text-cyan-400',
          bgLight: 'bg-cyan-500/10',
          badgeText: 'TikTok Live',
          dashUrl: 'https://www.tiktok.com/live/creator-hub',
          iconBg: 'bg-cyan-600',
        };
      default:
        return {
          border: 'border-slate-700 hover:border-slate-600',
          accent: 'text-indigo-400',
          bgLight: 'bg-indigo-500/10',
          badgeText: 'Custom RTMP',
          dashUrl: undefined,
          iconBg: 'bg-indigo-600',
        };
    }
  };

  const theme = getPlatformTheme();

  return (
    <div
      className={`bg-[#111827] border ${theme.border} rounded-xl p-4 transition-all duration-200 relative flex flex-col justify-between ${
        !destination.enabled ? 'opacity-70 bg-slate-900/60' : ''
      }`}
    >
      <div>
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-md ${theme.iconBg} flex items-center justify-center text-white shadow-sm font-bold text-xs`}
            >
              {destination.platform === 'twitch' ? 'TW' : destination.platform === 'youtube' ? 'YT' : destination.platform === 'kick' ? 'K' : 'RT'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {destination.name}
                </h3>
                {theme.dashUrl && (
                  <a
                    href={theme.dashUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                    title={`Open ${destination.name} Stream Key settings`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>{theme.badgeText}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    destination.status === 'broadcasting'
                      ? 'text-emerald-400 font-medium'
                      : destination.enabled
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }
                >
                  {destination.status === 'broadcasting'
                    ? 'Relaying Live'
                    : destination.enabled
                    ? 'Ready for Ingest'
                    : 'Paused'}
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle(destination.id)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                destination.enabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
              title={destination.enabled ? 'Disable destination' : 'Enable destination'}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  destination.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live Metrics strip if broadcasting */}
        {destination.status === 'broadcasting' && (
          <div className="grid grid-cols-3 gap-2 py-2 px-2.5 mb-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center font-mono">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Bitrate</span>
              <span className="text-xs font-semibold text-slate-200 tabular-nums">
                {destination.bitrateKbps.toLocaleString()} kbps
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">FPS</span>
              <span className="text-xs font-semibold text-slate-200 tabular-nums">
                {destination.fps}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Latency</span>
              <span className="text-xs font-semibold text-emerald-400 tabular-nums">
                {(destination.latencyMs / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {/* Stream Key / URL Editor */}
        {isEditing ? (
          <div className="space-y-2 mt-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                RTMP Ingest Server
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Platform Stream Key
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded px-2 py-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste stream key here..."
                  className="w-full bg-transparent font-mono text-[11px] text-slate-200 focus:outline-none tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-slate-400 hover:text-slate-200 ml-1"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setKeyInput(destination.streamKey);
                  setUrlInput(destination.serverUrl);
                  setIsEditing(false);
                }}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-[11px] transition-colors"
              >
                Save Destination
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px]">Stream Key:</span>
              <span className="font-mono text-[11px] text-slate-300">
                {destination.streamKey
                  ? showKey
                    ? destination.streamKey
                    : `••••••••••••${destination.streamKey.slice(-4)}`
                  : '(Not Set)'}
              </span>
            </div>

            {!destination.streamKey && (
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Stream key required to relay to {destination.name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-1 text-slate-400">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <Settings className="w-3 h-3" />
              <span>Configure Key</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {theme.dashUrl && (
            <a
              href={theme.dashUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Get Key &rarr;
            </a>
          )}
          {onDelete && destination.platform === 'custom' && (
            <button
              onClick={() => onDelete(destination.id)}
              className="text-rose-400 hover:text-rose-300 p-1"
              title="Delete destination"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
