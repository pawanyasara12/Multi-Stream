import React, { useState } from 'react';
import { Zap, Activity, Wifi, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { Destination } from '../types/stream';

interface BandwidthCalculatorProps {
  destinations: Destination[];
}

export const BandwidthCalculator: React.FC<BandwidthCalculatorProps> = ({ destinations }) => {
  const [streamBitrate, setStreamBitrate] = useState<number>(6200);
  const [activeCount, setActiveCount] = useState<number>(3);

  const localMultiUpload = (streamBitrate * activeCount) / 1000;
  const relayUpload = streamBitrate / 1000;
  const savedMbps = localMultiUpload - relayUpload;
  const percentSaved = Math.round(((localMultiUpload - relayUpload) / localMultiUpload) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Bandwidth Savings &amp; Network Health Calculator
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            See how much home upload bandwidth you save by streaming through StreamForge instead of encoding separate RTMP outputs on your gaming PC.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium">OBS Video Ingest Bitrate:</span>
              <span className="font-mono font-bold text-indigo-400">{streamBitrate} Kbps ({(streamBitrate / 1000).toFixed(1)} Mbps)</span>
            </div>
            <input
              type="range"
              min={3000}
              max={10000}
              step={200}
              value={streamBitrate}
              onChange={(e) => setStreamBitrate(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>3,000 Kbps (720p)</span>
              <span>6,000 Kbps (1080p Standard)</span>
              <span>10,000 Kbps (1080p High)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium">Simultaneous Streaming Targets:</span>
              <span className="font-mono font-bold text-emerald-400">{activeCount} Platforms</span>
            </div>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setActiveCount(count)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    activeCount === count
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {count} {count === 3 ? '(Twitch, YT, Kick)' : 'Platforms'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Without Relay */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">
                Direct OBS Multi-Stream (No Relay)
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                Heavy Upload Strain
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
                {localMultiUpload.toFixed(1)} Mbps
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your PC must encode and push {activeCount} separate RTMP streams simultaneously over your home Wi-Fi/Ethernet.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>High risk of in-game ping spikes &amp; dropped frames</span>
            </div>
          </div>

          {/* With StreamForge */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300">
                StreamForge Multistream Relay
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {percentSaved}% Saved
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {relayUpload.toFixed(1)} Mbps
              </div>
              <p className="text-xs text-slate-400 mt-1">
                OBS uploads only once to StreamForge. Our high-speed backbone fans out the video feed to all {activeCount} platforms.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero in-game lag, pristine stable 60 FPS broadcast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
