import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ObsIngestCard } from './components/ObsIngestCard';
import { DestinationCard } from './components/DestinationCard';
import { LiveMonitor } from './components/LiveMonitor';
import { UnifiedChat } from './components/UnifiedChat';
import { ObsSetupGuide } from './components/ObsSetupGuide';
import { ExporterModal } from './components/ExporterModal';
import { BandwidthCalculator } from './components/BandwidthCalculator';
import { AddDestinationModal } from './components/AddDestinationModal';
import { ChatOverlayView } from './components/ChatOverlayView';
import { StreamLogViewer } from './components/StreamLogViewer';
import { Destination, IngestConfig, PlatformId, StreamChatMessage, StreamLog } from './types/stream';
import { Plus, Radio, Zap, Layers, Activity } from 'lucide-react';

export default function App() {
  // Check if opened as OBS Browser Source overlay
  const isOverlayMode = new URLSearchParams(window.location.search).get('overlay') === 'chat';

  const [activeTab, setActiveTab] = useState<'studio' | 'setup' | 'chat' | 'engine' | 'diagnostics'>('studio');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Ingest state
  const [ingest, setIngest] = useState<IngestConfig>({
    serverUrl: 'rtmp://live.streamforge.io:1935/live',
    streamKey: 'sf_live_a982e0bf41d9c748',
    region: 'us-east (Auto-Detected)',
    status: 'idle',
    codec: 'h264 (High) / aac',
    resolution: '1920x1080',
    fps: 60,
    bitrateKbps: 6200,
    audioBitrateKbps: 160,
    uptimeSeconds: 0,
  });

  // Destinations (Twitch, YouTube, Kick pre-configured)
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      id: 'dest-twitch',
      name: 'Twitch TV',
      platform: 'twitch',
      enabled: true,
      serverUrl: 'rtmp://live.twitch.tv/app',
      streamKey: 'live_user_tw78291847120_k19a84',
      status: 'offline',
      bitrateKbps: 6000,
      fps: 60,
      droppedFrames: 0,
      latencyMs: 1450,
      creatorUrl: 'https://dashboard.twitch.tv/settings/stream',
    },
    {
      id: 'dest-youtube',
      name: 'YouTube Live',
      platform: 'youtube',
      enabled: true,
      serverUrl: 'rtmp://a.rtmp.youtube.com/live2',
      streamKey: '38a9-4k2m-90p1-vq24-81zx',
      status: 'offline',
      bitrateKbps: 6200,
      fps: 60,
      droppedFrames: 0,
      latencyMs: 3100,
      creatorUrl: 'https://studio.youtube.com/channel/live',
    },
    {
      id: 'dest-kick',
      name: 'Kick.com',
      platform: 'kick',
      enabled: true,
      serverUrl: 'rtmp://fa723fc1b122.global-contribute.live-video.net/app',
      streamKey: 'sk_us_8192a_90f238bc194a',
      status: 'offline',
      bitrateKbps: 6000,
      fps: 60,
      droppedFrames: 0,
      latencyMs: 1620,
      creatorUrl: 'https://kick.com/dashboard/settings/stream',
    },
  ]);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<StreamChatMessage[]>([
    {
      id: 'chat-1',
      platform: 'twitch',
      username: 'PixelNinja',
      userColor: '#a970ff',
      message: 'Yo stream is live! Let’s get this W today 🔥',
      timestamp: '19:42',
      isSubscriber: true,
    },
    {
      id: 'chat-2',
      platform: 'youtube',
      username: 'MarcusGamer99',
      userColor: '#f87171',
      message: 'Audio and 1080p60 quality are crystal clear on YouTube 👍',
      timestamp: '19:43',
      isModerator: true,
    },
    {
      id: 'chat-3',
      platform: 'kick',
      username: 'GreenGoblin_X',
      userColor: '#53FC18',
      message: 'Kick chat checking in! Zero latency right now 🚀',
      timestamp: '19:43',
      isSubscriber: true,
    },
  ]);

  // Stream logs
  const [streamLogs, setStreamLogs] = useState<StreamLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      source: 'Relay Engine',
      message: 'Multistream relay engine initialized on RTMP port 1935.',
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      source: 'OBS Ingest',
      message: 'Ready for OBS Studio connection. Stream key validated.',
    },
    {
      id: 'log-3',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      source: 'Relay Engine',
      message: 'Pass-through fan-out active for Twitch, YouTube, and Kick.',
    },
  ]);

  // Initial fetch from backend if available
  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.ingest) setIngest(data.ingest);
          if (data.destinations) setDestinations(data.destinations);
        }
      })
      .catch(() => {
        // Fallback to local default state
      });

    fetch('/api/chat')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setChatMessages(data);
      })
      .catch(() => {});

    fetch('/api/logs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setStreamLogs(data);
      })
      .catch(() => {});
  }, []);

  // Poll server state every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetch('/api/config')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (data.ingest) setIngest(data.ingest);
            if (data.destinations) setDestinations(data.destinations);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleRegenerateKey = () => {
    fetch('/api/config/stream-key/regenerate', { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.streamKey) {
          setIngest((prev) => ({ ...prev, streamKey: data.streamKey }));
        } else {
          // Local fallback
          const hex = Array.from({ length: 16 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join('');
          const newKey = `sf_live_${hex}`;
          setIngest((prev) => ({ ...prev, streamKey: newKey }));
        }
      })
      .catch(() => {
        const hex = Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        const newKey = `sf_live_${hex}`;
        setIngest((prev) => ({ ...prev, streamKey: newKey }));
      });
  };

  const handleUpdateRegion = (region: string) => {
    setIngest((prev) => ({ ...prev, region }));
    fetch('/api/config/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region }),
    }).catch(() => {});
  };

  const handleToggleDestination = (id: string) => {
    setDestinations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
    fetch(`/api/destinations/${id}/toggle`, { method: 'POST' }).catch(() => {});
  };

  const handleUpdateDestination = (id: string, updates: Partial<Destination>) => {
    setDestinations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    fetch(`/api/destinations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const handleDeleteDestination = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
    fetch(`/api/destinations/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleAddDestination = (newDest: {
    name: string;
    platform: PlatformId;
    serverUrl: string;
    streamKey: string;
    enabled: boolean;
  }) => {
    const destObj: Destination = {
      id: `dest-${Date.now()}`,
      name: newDest.name,
      platform: newDest.platform,
      serverUrl: newDest.serverUrl,
      streamKey: newDest.streamKey,
      enabled: newDest.enabled,
      status: ingest.status === 'relaying' ? 'broadcasting' : 'offline',
      bitrateKbps: 0,
      fps: 0,
      droppedFrames: 0,
      latencyMs: 1800,
    };
    setDestinations((prev) => [...prev, destObj]);
    fetch('/api/destinations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDest),
    }).catch(() => {});
  };

  const handleToggleStreamSession = () => {
    const nextStatus = ingest.status === 'relaying' ? 'idle' : 'relaying';
    setIngest((prev) => ({
      ...prev,
      status: nextStatus,
      uptimeSeconds: nextStatus === 'relaying' ? 1 : 0,
    }));
    setDestinations((prev) =>
      prev.map((d) => ({
        ...d,
        status: nextStatus === 'relaying' && d.enabled ? 'broadcasting' : 'offline',
        bitrateKbps: nextStatus === 'relaying' && d.enabled ? 6000 : 0,
        fps: nextStatus === 'relaying' && d.enabled ? 60 : 0,
      }))
    );

    // Add log
    setStreamLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: nextStatus === 'relaying' ? 'success' : 'warn',
        source: 'OBS Ingest',
        message:
          nextStatus === 'relaying'
            ? 'OBS connected to StreamForge. Relaying feed to Twitch, YouTube, and Kick simultaneously.'
            : 'Stream session stopped. Ingest connection closed.',
      },
      ...prev,
    ]);

    fetch('/api/relay/toggle-session', { method: 'POST' }).catch(() => {});
  };

  const handleSendMessage = (msg: {
    username: string;
    message: string;
    platform: PlatformId;
    userColor?: string;
  }) => {
    const newMsg: StreamChatMessage = {
      id: `chat-${Date.now()}`,
      platform: msg.platform,
      username: msg.username,
      userColor: msg.userColor || '#38bdf8',
      message: msg.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSubscriber: true,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    }).catch(() => {});
  };

  // If opened directly as an OBS Browser Source transparent overlay
  if (isOverlayMode) {
    return <ChatOverlayView chatMessages={chatMessages} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Strict 3-zone Header */}
      <Navbar
        ingest={ingest}
        destinations={destinations}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSimulate={handleToggleStreamSession}
        onOpenExporter={() => setActiveTab('engine')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Top OBS Ingest Credentials Card */}
            <ObsIngestCard
              ingest={ingest}
              onRegenerateKey={handleRegenerateKey}
              onOpenGuide={() => setActiveTab('setup')}
              onUpdateRegion={handleUpdateRegion}
            />

            {/* Studio Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Center: Live Monitor + Destinations Grid */}
              <div className="lg:col-span-8 space-y-6">
                {/* Live Ingest Monitor */}
                <LiveMonitor
                  ingest={ingest}
                  destinations={destinations}
                  onToggleStream={handleToggleStreamSession}
                />

                {/* Multistream Destinations Header & Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Simultaneous Streaming Destinations
                      </h2>
                      <p className="text-xs text-slate-400">
                        When OBS streams to StreamForge, video is broadcasted to all active platforms at the same time.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Destination</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {destinations.map((dest) => (
                      <DestinationCard
                        key={dest.id}
                        destination={dest}
                        onToggle={handleToggleDestination}
                        onUpdate={handleUpdateDestination}
                        onDelete={handleDeleteDestination}
                      />
                    ))}
                  </div>
                </div>

                {/* Live Event & Dispatch Logs */}
                <StreamLogViewer logs={streamLogs} />
              </div>

              {/* Right Sidebar: Unified Multi-Platform Chat */}
              <div className="lg:col-span-4 h-full">
                <UnifiedChat
                  chatMessages={chatMessages}
                  onSendMessage={handleSendMessage}
                  onOpenOverlayPreview={() => setActiveTab('chat')}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'setup' && <ObsSetupGuide ingest={ingest} />}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="max-w-2xl">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  OBS Studio Browser Source Chat Overlay
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Display real-time messages from Twitch, YouTube, and Kick directly inside your OBS Studio stream scene with a transparent browser overlay!
                </p>

                <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    1. Copy this Overlay URL:
                  </span>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5">
                    <span className="font-mono text-xs text-indigo-400 truncate flex-1">
                      {window.location.origin}?overlay=chat
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}?overlay=chat`);
                        alert('Copied OBS Browser Source URL to clipboard!');
                      }}
                      className="ml-2 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                    >
                      Copy URL
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 space-y-1">
                    <p>2. In OBS Studio, click the <strong className="text-white">+</strong> under Sources and select <strong className="text-indigo-400">Browser</strong>.</p>
                    <p>3. Paste the URL above, set Width: <strong className="text-white">450</strong>, Height: <strong className="text-white">600</strong>, and check &quot;Shutdown source when not visible&quot;.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              <UnifiedChat
                chatMessages={chatMessages}
                onSendMessage={handleSendMessage}
                onOpenOverlayPreview={() => {}}
              />
            </div>
          </div>
        )}

        {activeTab === 'engine' && (
          <ExporterModal ingest={ingest} destinations={destinations} />
        )}

        {activeTab === 'diagnostics' && (
          <BandwidthCalculator destinations={destinations} />
        )}
      </main>

      {/* Add Destination Modal */}
      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDestination}
      />
    </div>
  );
}
