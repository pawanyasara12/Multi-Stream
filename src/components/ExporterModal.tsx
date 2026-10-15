import React, { useState } from 'react';
import { Copy, Check, Terminal, Server, FileCode, Download, ShieldCheck } from 'lucide-react';
import { IngestConfig, Destination } from '../types/stream';

interface ExporterModalProps {
  ingest: IngestConfig;
  destinations: Destination[];
}

export const ExporterModal: React.FC<ExporterModalProps> = ({ ingest, destinations }) => {
  const [activeTab, setActiveTab] = useState<'ffmpeg' | 'docker' | 'nginx'>('ffmpeg');
  const [copied, setCopied] = useState(false);

  const enabledDestinations = destinations.filter((d) => d.enabled && d.streamKey);

  const getFFmpegCommand = () => {
    const outputs = enabledDestinations
      .map((d) => {
        const fullUrl = d.serverUrl.endsWith('/')
          ? `${d.serverUrl}${d.streamKey}`
          : `${d.serverUrl}/${d.streamKey}`;
        return `-c:v copy -c:a copy -f flv "${fullUrl}"`;
      })
      .join(' \\\n  ');

    return `# 1. Run this command on your PC or VPS to start a local RTMP fan-out server:
ffmpeg -listen 1 -i "rtmp://0.0.0.0:1935/live/${ingest.streamKey}" \\
  ${outputs || '# (Add stream keys to Twitch, YouTube, and Kick to populate destinations)'}`;
  };

  const getDockerCompose = () => {
    return `version: '3.8'

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
      - RTMP_KEY=${ingest.streamKey}
`;
  };

  const getNginxConf = () => {
    const pushLines = enabledDestinations
      .map((d) => {
        const full = d.serverUrl.endsWith('/')
          ? `${d.serverUrl}${d.streamKey}`
          : `${d.serverUrl}/${d.streamKey}`;
        return `        push ${full};`;
      })
      .join('\n');

    return `worker_processes auto;
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
${pushLines || '            # Add your destination stream keys in StreamForge UI'}
        }
    }
}
`;
  };

  const currentContent =
    activeTab === 'ffmpeg'
      ? getFFmpegCommand()
      : activeTab === 'docker'
      ? getDockerCompose()
      : getNginxConf();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Self-Host &amp; Relay Exporters
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Want to run the multistream relay locally on your streaming machine or on a private VPS (like a $4/month DigitalOcean Droplet)? Use these pre-generated scripts containing all your configured Twitch, YouTube, and Kick stream keys.
        </p>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-5 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('ffmpeg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'ffmpeg'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>FFmpeg Command</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'docker'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Docker Compose</span>
          </button>

          <button
            onClick={() => setActiveTab('nginx')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'nginx'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Nginx RTMP Config</span>
          </button>
        </div>

        {/* Code Viewport */}
        <div className="mt-4 relative">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-t-lg text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              {activeTab === 'ffmpeg'
                ? 'terminal-command.sh'
                : activeTab === 'docker'
                ? 'docker-compose.yml'
                : 'nginx.conf'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Configuration</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border-x border-b border-slate-800 rounded-b-lg font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            {currentContent}
          </pre>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Uses <strong className="text-slate-300">-c:v copy -c:a copy</strong> pass-through mode: consumes virtually 0% CPU with zero transcoding lag.
          </span>
        </div>
      </div>
    </div>
  );
};
