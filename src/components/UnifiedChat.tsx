import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Filter,
  Check,
  Copy
} from 'lucide-react';
import { StreamChatMessage, PlatformId } from '../types/stream';

interface UnifiedChatProps {
  chatMessages: StreamChatMessage[];
  onSendMessage: (msg: { username: string; message: string; platform: PlatformId }) => void;
  onOpenOverlayPreview: () => void;
}

export const UnifiedChat: React.FC<UnifiedChatProps> = ({
  chatMessages,
  onSendMessage,
  onOpenOverlayPreview,
}) => {
  const [filter, setFilter] = useState<'all' | PlatformId>('all');
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState('Streamer');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('twitch');
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage({
      username: username.trim() || 'Streamer',
      message: inputText.trim(),
      platform: selectedPlatform,
    });
    setInputText('');
  };

  const handleSimulateChat = () => {
    const randomSamples = [
      {
        platform: 'kick' as PlatformId,
        username: 'AcrobatGuy',
        message: 'Multistream is working smooth, no frame drops on Kick!',
        userColor: '#53FC18',
      },
      {
        platform: 'twitch' as PlatformId,
        username: 'Valkyrie_9',
        message: 'Twitch chat reporting in! W stream setup 🔥',
        userColor: '#9146FF',
      },
      {
        platform: 'youtube' as PlatformId,
        username: 'TechGamerHQ',
        message: '1080p60 stream looks super crisp on YouTube. Nice relay server!',
        userColor: '#FF0000',
      },
      {
        platform: 'twitch' as PlatformId,
        username: 'HyperSpeed',
        message: 'Are you using OBS Studio custom RTMP? That relay key is clutch.',
        userColor: '#9146FF',
      },
      {
        platform: 'kick' as PlatformId,
        username: 'NightWolf',
        message: 'Followed! Kick quality is insane today.',
        userColor: '#53FC18',
      },
    ];
    const picked = randomSamples[Math.floor(Math.random() * randomSamples.length)];
    onSendMessage(picked);
  };

  const filteredMessages = chatMessages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.platform === filter;
  });

  const getPlatformBadge = (platform: PlatformId) => {
    switch (platform) {
      case 'twitch':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#9146FF]/20 text-[#a970ff] border border-[#9146FF]/30">
            TW
          </span>
        );
      case 'youtube':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
            YT
          </span>
        );
      case 'kick':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#53FC18] border border-emerald-500/30">
            KICK
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
            LIVE
          </span>
        );
    }
  };

  const copyOverlayUrl = () => {
    const url = `${window.location.origin}?overlay=chat`;
    navigator.clipboard.writeText(url);
    setCopiedOverlay(true);
    setTimeout(() => setCopiedOverlay(false), 2000);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl flex flex-col h-full shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Unified Multistream Chat</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyOverlayUrl}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            title="Copy OBS Browser Source URL for transparent chat in your stream scenes"
          >
            {copiedOverlay ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copiedOverlay ? 'Copied Overlay' : 'OBS Chat Overlay'}</span>
          </button>

          <button
            onClick={handleSimulateChat}
            className="flex items-center gap-1 text-[11px] font-medium text-indigo-300 hover:text-indigo-200 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
            title="Simulate incoming viewer message"
          >
            <Sparkles className="w-3 h-3" />
            <span>Simulate</span>
          </button>
        </div>
      </div>

      {/* Platform Filter Tabs (interactive filter control) */}
      <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          All Platforms
        </button>
        <button
          onClick={() => setFilter('twitch')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            filter === 'twitch'
              ? 'bg-[#9146FF]/30 text-[#a970ff] border border-[#9146FF]/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Twitch
        </button>
        <button
          onClick={() => setFilter('youtube')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            filter === 'youtube'
              ? 'bg-red-500/30 text-red-300 border border-red-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          YouTube
        </button>
        <button
          onClick={() => setFilter('kick')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            filter === 'kick'
              ? 'bg-emerald-500/30 text-[#53FC18] border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Kick
        </button>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 p-3.5 overflow-y-auto space-y-2.5 min-h-[300px] max-h-[460px] bg-slate-950/40"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <MessageSquare className="w-8 h-8 stroke-1 text-slate-600 mb-2" />
            <p className="text-xs">No chat messages for this filter yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Click &quot;Simulate&quot; above or send a message below to test.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="text-xs leading-relaxed flex items-start gap-2 bg-slate-900/40 hover:bg-slate-900/80 p-2 rounded-lg transition-colors border border-slate-800/50"
            >
              <div className="mt-0.5">{getPlatformBadge(msg.platform)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-semibold"
                    style={{ color: msg.userColor || '#f1f5f9' }}
                  >
                    {msg.username}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="text-slate-300 mt-0.5 text-xs break-words">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-xs">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your Name"
            className="w-28 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as PlatformId)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="twitch">Broadcast to Twitch</option>
            <option value="youtube">Broadcast to YouTube</option>
            <option value="kick">Broadcast to Kick</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a chat message to broadcast..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shrink-0"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
