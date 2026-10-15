import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Destination, IngestConfig, StreamChatMessage, StreamLog } from './src/types/stream';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory relay state
let ingestConfig: IngestConfig = {
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
};

let destinations: Destination[] = [
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
];

let streamLogs: StreamLog[] = [
  {
    id: 'log-1',
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    source: 'Relay Engine',
    message: 'Multistream relay engine initialized. Listening on port 1935 (RTMP) and 8080 (HLS/WebSocket).',
  },
  {
    id: 'log-2',
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    source: 'OBS Ingest',
    message: 'Ingest mount point ready at rtmp://live.streamforge.io:1935/live/{stream_key}',
  },
  {
    id: 'log-3',
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    source: 'Relay Engine',
    message: 'Destinations configured: Twitch, YouTube Live, Kick. Pass-through mode enabled (0% re-encode latency).',
  },
];

let chatMessages: StreamChatMessage[] = [
  {
    id: 'chat-1',
    platform: 'twitch',
    username: 'PixelNinja',
    userColor: '#9146FF',
    message: 'Yo stream is live! Let’s get this W today 🔥',
    timestamp: '19:42',
    isSubscriber: true,
  },
  {
    id: 'chat-2',
    platform: 'youtube',
    username: 'MarcusGamer99',
    userColor: '#FF0000',
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
];

// Helper to simulate relay active state
let relayTimer: NodeJS.Timeout | null = null;
let uptimeCounter = 0;

function setRelayStatus(status: 'idle' | 'relaying') {
  ingestConfig.status = status;
  if (status === 'relaying') {
    destinations = destinations.map((d) => ({
      ...d,
      status: d.enabled ? 'broadcasting' : 'offline',
      bitrateKbps: d.enabled ? Math.floor(5900 + Math.random() * 400) : 0,
      fps: d.enabled ? 60 : 0,
    }));
    if (!relayTimer) {
      relayTimer = setInterval(() => {
        uptimeCounter += 1;
        ingestConfig.uptimeSeconds = uptimeCounter;
        ingestConfig.bitrateKbps = Math.floor(6150 + Math.sin(uptimeCounter) * 120);
        destinations = destinations.map((d) => {
          if (!d.enabled) return d;
          return {
            ...d,
            bitrateKbps: Math.floor(6000 + (Math.random() * 300 - 150)),
            latencyMs: Math.max(1200, d.latencyMs + Math.floor(Math.random() * 40 - 20)),
          };
        });
      }, 1000);
    }
  } else {
    uptimeCounter = 0;
    ingestConfig.uptimeSeconds = 0;
    if (relayTimer) {
      clearInterval(relayTimer);
      relayTimer = null;
    }
    destinations = destinations.map((d) => ({
      ...d,
      status: 'offline',
      bitrateKbps: 0,
      fps: 0,
    }));
  }
}

// API Routes
app.get('/api/config', (req, res) => {
  res.json({
    ingest: ingestConfig,
    destinations,
  });
});

app.post('/api/config/stream-key/regenerate', (req, res) => {
  const hex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  ingestConfig.streamKey = `sf_live_${hex}`;
  streamLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    level: 'warn',
    source: 'OBS Ingest',
    message: `Stream Key was regenerated by user. Previous key invalidated. New key: ${ingestConfig.streamKey}`,
  });
  res.json({ streamKey: ingestConfig.streamKey });
});

app.post('/api/config/update', (req, res) => {
  const { serverUrl, region } = req.body;
  if (serverUrl) ingestConfig.serverUrl = serverUrl;
  if (region) ingestConfig.region = region;
  res.json({ success: true, ingest: ingestConfig });
});

app.get('/api/destinations', (req, res) => {
  res.json(destinations);
});

app.post('/api/destinations', (req, res) => {
  const { name, platform, serverUrl, streamKey, enabled } = req.body;
  const newDest: Destination = {
    id: `dest-${Date.now()}`,
    name: name || `${platform.toUpperCase()} Stream`,
    platform: platform || 'custom',
    enabled: enabled !== undefined ? enabled : true,
    serverUrl: serverUrl || 'rtmp://live.twitch.tv/app',
    streamKey: streamKey || '',
    status: ingestConfig.status === 'relaying' && enabled ? 'broadcasting' : 'offline',
    bitrateKbps: 0,
    fps: 0,
    droppedFrames: 0,
    latencyMs: 1800,
  };
  destinations.push(newDest);
  streamLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    source: 'Relay Engine',
    message: `Added destination: ${newDest.name} (${newDest.platform.toUpperCase()})`,
  });
  res.status(201).json(newDest);
});

app.put('/api/destinations/:id', (req, res) => {
  const { id } = req.params;
  const index = destinations.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Destination not found' });
  }
  destinations[index] = { ...destinations[index], ...req.body };
  res.json(destinations[index]);
});

app.delete('/api/destinations/:id', (req, res) => {
  const { id } = req.params;
  const target = destinations.find((d) => d.id === id);
  destinations = destinations.filter((d) => d.id !== id);
  if (target) {
    streamLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      source: 'Relay Engine',
      message: `Removed destination: ${target.name}`,
    });
  }
  res.json({ success: true, id });
});

app.post('/api/destinations/:id/toggle', (req, res) => {
  const { id } = req.params;
  const dest = destinations.find((d) => d.id === id);
  if (!dest) {
    return res.status(404).json({ error: 'Destination not found' });
  }
  dest.enabled = !dest.enabled;
  if (ingestConfig.status === 'relaying') {
    dest.status = dest.enabled ? 'broadcasting' : 'offline';
    dest.bitrateKbps = dest.enabled ? 6000 : 0;
    dest.fps = dest.enabled ? 60 : 0;
  }
  streamLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    source: 'Relay Engine',
    message: `${dest.name} destination ${dest.enabled ? 'enabled' : 'disabled'} for relaying.`,
  });
  res.json(dest);
});

// Toggle simulation of OBS streaming state
app.post('/api/relay/toggle-session', (req, res) => {
  const nextStatus = ingestConfig.status === 'relaying' ? 'idle' : 'relaying';
  setRelayStatus(nextStatus);
  streamLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    level: nextStatus === 'relaying' ? 'success' : 'warn',
    source: 'OBS Ingest',
    message:
      nextStatus === 'relaying'
        ? `OBS Studio connected! Audio/Video payload detected (1080p60 @ 6200 kbps). Relaying to ${
            destinations.filter((d) => d.enabled).length
          } active platforms.`
        : 'OBS Studio disconnected. Ingest session closed. All destination streams safely terminated.',
  });
  res.json({ status: nextStatus, ingest: ingestConfig, destinations });
});

// Export commands
app.get('/api/export/ffmpeg', (req, res) => {
  const enabledDestinations = destinations.filter((d) => d.enabled && d.streamKey);
  const outputs = enabledDestinations
    .map((d) => {
      const fullUrl = d.serverUrl.endsWith('/')
        ? `${d.serverUrl}${d.streamKey}`
        : `${d.serverUrl}/${d.streamKey}`;
      return `-c:v copy -c:a copy -f flv "${fullUrl}"`;
    })
    .join(' ');

  const singleCommand = `ffmpeg -listen 1 -i "rtmp://0.0.0.0:1935/live/${ingestConfig.streamKey}" ${outputs}`;

  res.json({
    singleCommand,
    destinationsCount: enabledDestinations.length,
    ingestUrl: `rtmp://0.0.0.0:1935/live/${ingestConfig.streamKey}`,
  });
});

app.get('/api/export/docker', (req, res) => {
  const enabledDests = destinations.filter((d) => d.enabled && d.streamKey);
  const pushDirectives = enabledDests
    .map((d) => {
      const full = d.serverUrl.endsWith('/') ? `${d.serverUrl}${d.streamKey}` : `${d.serverUrl}/${d.streamKey}`;
      return `        push ${full};`;
    })
    .join('\n');

  const dockerCompose = `version: '3.8'

services:
  streamforge-relay:
    image: tiangolo/nginx-rtmp
    container_name: streamforge_rtmp_relay
    restart: always
    ports:
      - "1935:1935"
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    environment:
      - RTMP_KEY=${ingestConfig.streamKey}
`;

  const nginxConf = `worker_processes auto;
rtmp_auto_push on;
events {
    worker_connections 1024;
}

rtmp {
    server {
        listen 1935;
        chunk_size 4096;

        application live {
            live on;
            record off;

            # StreamForge Fan-Out Multistream Relay
${pushDirectives || '            # Add your destination stream keys in StreamForge UI'}
        }
    }
}
`;

  res.json({ dockerCompose, nginxConf });
});

// Chat routes
app.get('/api/chat', (req, res) => {
  res.json(chatMessages);
});

app.post('/api/chat', (req, res) => {
  const { username, message, platform } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }
  const newMsg: StreamChatMessage = {
    id: `chat-${Date.now()}`,
    platform: platform || 'twitch',
    username: username || 'Streamer',
    userColor: '#3B82F6',
    message: message.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isModerator: true,
  };
  chatMessages.push(newMsg);
  if (chatMessages.length > 100) {
    chatMessages = chatMessages.slice(chatMessages.length - 100);
  }
  res.status(201).json(newMsg);
});

// Logs route
app.get('/api/logs', (req, res) => {
  res.json(streamLogs);
});

// Attach Vite middleware in development, or serve static dist in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`StreamForge server running on http://localhost:${PORT}`);
  });
}

startServer();
