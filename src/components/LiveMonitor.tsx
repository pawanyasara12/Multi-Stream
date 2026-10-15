import React, { useEffect, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  Maximize2,
  Volume2,
  Radio,
  Zap,
  MonitorPlay,
  Camera,
  Activity
} from 'lucide-react';
import { IngestConfig, Destination } from '../types/stream';

interface LiveMonitorProps {
  ingest: IngestConfig;
  destinations: Destination[];
  onToggleStream: () => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  ingest,
  destinations,
  onToggleStream,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [usingWebcam, setUsingWebcam] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isLive = ingest.status === 'relaying' || usingWebcam;
  const activeDestinations = destinations.filter((d) => d.enabled);

  // Bandwidth calculation: OBS sends 1 stream (e.g. 6.2 Mbps). Without relay, OBS would send 6.2 * N platforms
  const rawFanoutBandwidth = Math.max(1, activeDestinations.length) * (ingest.bitrateKbps / 1000);
  const actualObsBandwidth = isLive ? ingest.bitrateKbps / 1000 : 0;
  const bandwidthSaved = Math.max(0, rawFanoutBandwidth - actualObsBandwidth);

  // In-browser webcam or screen share toggle
  const toggleVirtualObs = async () => {
    if (usingWebcam) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
      setUsingWebcam(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        setMediaStream(stream);
        setUsingWebcam(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.warn('Webcam permission not granted, continuing with animated canvas simulator.', err);
        // Fallback: simply start simulation mode
        onToggleStream();
      }
    }
  };

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      if (usingWebcam && videoRef.current && videoRef.current.readyState >= 2) {
        // Draw video frame from camera
        ctx.drawImage(videoRef.current, 0, 0, w, h);

        // Overlay timecode and stream watermark
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(16, 16, 210, 40);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillText('LIVE INGEST: VIRTUAL OBS', 28, 41);
      } else if (ingest.status === 'relaying') {
        // Animated dynamic simulated broadcast feed
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, h);

        // Subtle moving gradient mesh
        const gradient = ctx.createLinearGradient(
          (Math.sin(frame * 0.02) * w) / 2 + w / 2,
          0,
          w,
          h
        );
        gradient.addColorStop(0, '#1e1b4b');
        gradient.addColorStop(0.5, '#0f172a');
        gradient.addColorStop(1, '#064e3b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Center visualizer circle
        const radius = 60 + Math.sin(frame * 0.1) * 8;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(w / 2, h / 2, radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.fill();

        // Audio waveform overlay
        ctx.beginPath();
        ctx.strokeStyle = '#53FC18';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x += 6) {
          const wave =
            Math.sin(x * 0.04 + frame * 0.08) *
            Math.cos(x * 0.02) *
            25 *
            (0.8 + Math.sin(frame * 0.1) * 0.2);
          if (x === 0) ctx.moveTo(x, h - 70 + wave);
          else ctx.lineTo(x, h - 70 + wave);
        }
        ctx.stroke();

        // Timecode
        const seconds = ingest.uptimeSeconds;
        const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const ss = (seconds % 60).toString().padStart(2, '0');
        const ff = (frame % 60).toString().padStart(2, '0');

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(16, 16, 260, 44);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.strokeRect(16, 16, 260, 44);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "JetBrains Mono", monospace';
        ctx.fillText(`REC ${hh}:${mm}:${ss}:${ff}`, 32, 43);

        // Top right "STREAMFORGE RELAY"
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(w - 200, 16, 184, 34);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText('1080p60 · NVENC CBR', w - 188, 38);
      } else {
        // Idle standby pattern
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(0, 0, w, h);

        // SMPTE Bars
        const colors = [
          '#b4b4b4',
          '#b4b400',
          '#00b4b4',
          '#00b400',
          '#b400b4',
          '#b40000',
          '#0000b4',
        ];
        const barWidth = w / colors.length;
        colors.forEach((c, idx) => {
          ctx.fillStyle = c;
          ctx.fillRect(idx * barWidth, 0, barWidth, h * 0.65);
        });

        // Bottom test strips
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h * 0.65, w, h * 0.35);

        // Center text box
        ctx.fillStyle = 'rgba(11, 15, 25, 0.92)';
        ctx.fillRect(w / 2 - 200, h / 2 - 45, 400, 90);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w / 2 - 200, h / 2 - 45, 400, 90);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AWAITING OBS STUDIO RTMP SIGNAL', w / 2, h / 2 - 12);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(ingest.serverUrl, w / 2, h / 2 + 15);
        ctx.fillText(`Key: ${ingest.streamKey}`, w / 2, h / 2 + 32);
        ctx.textAlign = 'left';
      }

      // Audio simulation level
      if (ingest.status === 'relaying' || usingWebcam) {
        setAudioLevel(0.4 + Math.sin(frame * 0.12) * 0.35 + Math.random() * 0.15);
      } else {
        setAudioLevel(0);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [ingest.status, ingest.uptimeSeconds, ingest.serverUrl, ingest.streamKey, usingWebcam]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col"
    >
      {/* Hidden video element for webcam capture */}
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Top Monitor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ingest Program Feed</span>
          </div>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-slate-400">1920x1080 @ 60fps</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Virtual OBS Webcam / Screen button */}
          <button
            onClick={toggleVirtualObs}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              usingWebcam
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Use your webcam or screen to simulate an OBS stream directly in browser"
          >
            <Camera className="w-3 h-3" />
            <span>{usingWebcam ? 'Stop Camera' : 'Webcam Test'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport (16:9 Canvas) */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-contain"
        />

        {/* Audio VU Meter overlay on the right edge */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-44 w-3.5 bg-slate-950/80 rounded border border-slate-700/60 p-0.5 flex flex-col justify-end backdrop-blur-sm pointer-events-none">
          <div
            className={`w-full rounded-sm transition-all duration-75 ${
              audioLevel > 0.85
                ? 'bg-rose-500'
                : audioLevel > 0.65
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
            style={{ height: `${Math.min(100, Math.max(5, audioLevel * 100))}%` }}
          />
          <div className="text-[8px] font-mono text-slate-400 text-center mt-1">VU</div>
        </div>

        {/* Ingest signal badge bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span className="text-slate-300">
            {isLive ? `${ingest.bitrateKbps.toLocaleString()} kbps` : 'NO SIGNAL'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{ingest.codec}</span>
        </div>
      </div>

      {/* HUD Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-800/80 bg-slate-900/60 border-t border-slate-800 text-xs">
        <div className="px-3 py-2.5">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wide">
            OBS Ingest Bitrate
          </span>
          <span className="text-xs font-semibold font-mono text-white tabular-nums">
            {isLive ? `${ingest.bitrateKbps.toLocaleString()} kbps` : '0 kbps'}
          </span>
        </div>

        <div className="px-3 py-2.5">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wide">
            Keyframe Interval
          </span>
          <span className="text-xs font-semibold font-mono text-emerald-400 tabular-nums">
            2.0s (Twitch/Kick Compliant)
          </span>
        </div>

        <div className="px-3 py-2.5">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wide">
            Audio Sample / Codec
          </span>
          <span className="text-xs font-semibold font-mono text-slate-200 tabular-nums">
            AAC · 48 kHz · 160 kbps
          </span>
        </div>

        <div className="px-3 py-2.5 bg-indigo-950/20">
          <span className="block text-[10px] text-indigo-300 uppercase tracking-wide">
            Upload Bandwidth Saved
          </span>
          <span className="text-xs font-semibold font-mono text-indigo-400 tabular-nums">
            {isLive ? `+${(bandwidthSaved * 1000).toFixed(0)} kbps saved` : 'Save ~66% local upload'}
          </span>
        </div>
      </div>
    </div>
  );
};
