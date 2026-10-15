import React, { useState } from 'react';
import { X, Plus, Globe, Key } from 'lucide-react';
import { PlatformId, Destination } from '../types/stream';

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dest: {
    name: string;
    platform: PlatformId;
    serverUrl: string;
    streamKey: string;
    enabled: boolean;
  }) => void;
}

export const AddDestinationModal: React.FC<AddDestinationModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [platform, setPlatform] = useState<PlatformId>('custom');
  const [name, setName] = useState('');
  const [serverUrl, setServerUrl] = useState('rtmp://');
  const [streamKey, setStreamKey] = useState('');

  if (!isOpen) return null;

  const handlePlatformChange = (p: PlatformId) => {
    setPlatform(p);
    switch (p) {
      case 'twitch':
        setName('Twitch Channel');
        setServerUrl('rtmp://live.twitch.tv/app');
        break;
      case 'youtube':
        setName('YouTube Primary');
        setServerUrl('rtmp://a.rtmp.youtube.com/live2');
        break;
      case 'kick':
        setName('Kick Live');
        setServerUrl('rtmp://fa723fc1b122.global-contribute.live-video.net/app');
        break;
      case 'facebook':
        setName('Facebook Gaming');
        setServerUrl('rtmps://live-api-s.facebook.com:443/rtmp');
        break;
      case 'tiktok':
        setName('TikTok Live');
        setServerUrl('rtmp://live-push.tiktok-row.org/live');
        break;
      default:
        setName('Custom RTMP Destination');
        setServerUrl('rtmp://');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl || !streamKey) return;
    onAdd({
      name: name || `${platform.toUpperCase()} Destination`,
      platform,
      serverUrl,
      streamKey,
      enabled: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-white tracking-tight mb-1">
          Add Streaming Destination
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Add another platform or custom RTMP ingest to relay your OBS stream to.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Platform Service</label>
            <div className="grid grid-cols-3 gap-2">
              {(['twitch', 'youtube', 'kick', 'facebook', 'tiktok', 'custom'] as PlatformId[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePlatformChange(p)}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium capitalize border transition-colors ${
                    platform === p
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Destination Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Second Channel"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">RTMP Server Ingest URL</label>
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-2">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                required
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full bg-transparent font-mono text-[11px] text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Platform Stream Key</label>
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-2">
              <Key className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="password"
                required
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="Paste platform stream key..."
                className="w-full bg-transparent font-mono text-[11px] text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              Add Destination
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
