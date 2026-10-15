import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Settings,
  ShieldCheck,
  Zap,
  ArrowRight,
  Monitor,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { IngestConfig } from '../types/stream';

interface ObsSetupGuideProps {
  ingest: IngestConfig;
}

export const ObsSetupGuide: React.FC<ObsSetupGuideProps> = ({ ingest }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadObsProfile = () => {
    const configContent = `[General]
Name=StreamForge Multistream

[Video]
BaseCX=1920
BaseCY=1080
OutputCX=1920
OutputCY=1080
FPSCommon=60

[SimpleOutput]
VBitrate=6000
ABitrate=160
Preset=quality
NVENCPreset2=p5

[AdvOut]
Encoder=jim_nvenc
Track1Bitrate=160
RateControl=CBR
Bitrate=6000
KeyintSec=2

[Stream]
Type=rtmp_custom
Server=${ingest.serverUrl}
Key=${ingest.streamKey}
`;
    const blob = new Blob([configContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'streamforge-obs-settings.ini';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero Explainer Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>Single Ingest &rarr; Infinite Fan-Out</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            How to Connect OBS Studio to Multistream
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Instead of streaming directly to Twitch, you stream <strong className="text-white">once</strong> to StreamForge with your unique stream key. StreamForge then duplicates and relays your stream to <strong className="text-purple-400">Twitch</strong>, <strong className="text-red-400">YouTube</strong>, and <strong className="text-emerald-400">Kick</strong> simultaneously. Your gaming PC only uploads a single video stream!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={downloadObsProfile}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download OBS Profile (.ini)</span>
            </button>
            <span className="text-xs text-slate-400">
              Or manually copy the two fields below into OBS:
            </span>
          </div>
        </div>
      </div>

      {/* Step by Step Visual Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Step 1 */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="text-base font-semibold text-white">Open OBS Stream Settings</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              In OBS Studio, click on <strong className="text-slate-200">Settings</strong> (bottom-right panel), then click on the <strong className="text-slate-200">Stream</strong> tab on the left.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Service:</span>
                <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Custom...
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Change the dropdown from Twitch/YouTube to &quot;Custom...&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="text-base font-semibold text-white">Paste Server &amp; Key</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Paste your StreamForge Ingest URL and Stream Key into the two fields.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Server:</span>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-1">
                  <span className="font-mono text-[10px] text-slate-300 truncate flex-1">
                    {ingest.serverUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(ingest.serverUrl, 'guide-server')}
                    className="ml-1 text-slate-400 hover:text-white"
                  >
                    {copiedField === 'guide-server' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Stream Key:</span>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-1">
                  <span className="font-mono text-[10px] text-slate-300 truncate flex-1">
                    {ingest.streamKey}
                  </span>
                  <button
                    onClick={() => copyToClipboard(ingest.streamKey, 'guide-key')}
                    className="ml-1 text-slate-400 hover:text-white"
                  >
                    {copiedField === 'guide-key' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="text-base font-semibold text-white">Click Start Streaming!</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Click <strong className="text-emerald-400">Start Streaming</strong> in OBS. StreamForge receives your 1080p feed and instantly fans it out to all enabled platforms!
            </p>

            <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span>Output Encoding:</span>
                <span className="font-mono text-emerald-400">Pass-Through (0% CPU)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Active Targets:</span>
                <span className="font-mono text-indigo-400">Twitch + YouTube + Kick</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Encoder Settings Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-3">
          Recommended OBS Output Settings for Tri-Platform Streaming
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-4 font-medium">Setting</th>
                <th className="py-2 pr-4 font-medium">Recommended Value</th>
                <th className="py-2 pr-4 font-medium">Why This Matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 pr-4 font-medium text-white">Video Bitrate</td>
                <td className="py-2.5 pr-4 font-mono text-indigo-400">6,000 - 8,000 Kbps</td>
                <td className="py-2.5 pr-4 text-slate-400">Twitch hard cap is 8,000 Kbps; Kick accepts 8,000; YouTube auto-transcodes.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-white">Rate Control</td>
                <td className="py-2.5 pr-4 font-mono text-emerald-400">CBR (Constant Bitrate)</td>
                <td className="py-2.5 pr-4 text-slate-400">Required by all 3 platforms to prevent buffering and dropped frames.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-white">Keyframe Interval</td>
                <td className="py-2.5 pr-4 font-mono text-emerald-400">2 seconds (or 120 frames)</td>
                <td className="py-2.5 pr-4 text-slate-400">Strictly required by Twitch and Kick ingest servers.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-white">Audio Bitrate &amp; Codec</td>
                <td className="py-2.5 pr-4 font-mono text-indigo-400">160 Kbps · AAC · 48 kHz</td>
                <td className="py-2.5 pr-4 text-slate-400">Industry standard broadcast audio spec across all live services.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
