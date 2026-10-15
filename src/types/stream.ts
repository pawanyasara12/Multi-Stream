export type PlatformId = 'twitch' | 'youtube' | 'kick' | 'custom' | 'facebook' | 'tiktok';

export interface Destination {
  id: string;
  name: string;
  platform: PlatformId;
  enabled: boolean;
  serverUrl: string;
  streamKey: string;
  status: 'offline' | 'connecting' | 'broadcasting' | 'error';
  bitrateKbps: number;
  fps: number;
  droppedFrames: number;
  latencyMs: number;
  lastError?: string;
  creatorUrl?: string;
}

export interface IngestConfig {
  serverUrl: string;
  streamKey: string;
  region: string;
  status: 'idle' | 'listening' | 'receiving' | 'relaying';
  codec: string;
  resolution: string;
  fps: number;
  bitrateKbps: number;
  audioBitrateKbps: number;
  uptimeSeconds: number;
  connectedAt?: string;
}

export interface StreamChatMessage {
  id: string;
  platform: PlatformId;
  username: string;
  userColor?: string;
  avatarUrl?: string;
  badges?: string[];
  message: string;
  timestamp: string;
  isModerator?: boolean;
  isSubscriber?: boolean;
}

export interface StreamLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  source: 'OBS Ingest' | 'Twitch' | 'YouTube' | 'Kick' | 'Relay Engine';
  message: string;
}

export interface StreamHealthMetrics {
  timestamp: number;
  ingestBitrate: number;
  targetBitrate: number;
  fps: number;
  droppedFpsRatio: number;
  cpuLoadPercent: number;
  memoryUsageMb: number;
  networkOutKbps: number;
}
