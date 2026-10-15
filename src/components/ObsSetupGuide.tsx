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
  ExternalLink,
  AlertTriangle,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';
import { IngestConfig } from '../types/stream';

interface ObsSetupGuideProps {
  ingest: IngestConfig;
}

export const ObsSetupGuide: React.FC<ObsSetupGuideProps> = ({ ingest }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'relay' | 'plugin' | 'troubleshooting'>('troubleshooting');

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
      {/* Alert banner directly answering the user's error */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-200">
              Why OBS Shows &quot;Host name not found. Make sure you enter a valid streaming server...&quot;
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              When OBS connects to an RTMP address, it performs a DNS lookup on the domain name. If the domain has no active DNS record, OBS cannot find the server IP and fails immediately.
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">
                  Fix 1: Use Local Loopback (127.0.0.1)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Change the Server in OBS to <strong className="text-white font-mono">rtmp://127.0.0.1:1935/live</strong>. Your computer always recognizes 127.0.0.1 locally, so DNS never fails!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-semibold text-indigo-400 block mb-1">
                  Fix 2: Use OBS Multi-RTMP Plugin
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Stream directly from inside OBS to Twitch, YouTube, and Kick without running any server at all! (See Plugin Guide tab below).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveGuideTab('troubleshooting')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeGuideTab === 'troubleshooting'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>DNS Error Fix &amp; Local Relay</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('plugin')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeGuideTab === 'plugin'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>OBS Multi-RTMP Plugin (No Server Needed)</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('relay')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeGuideTab === 'relay'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Standard Custom RTMP Setup</span>
        </button>
      </div>

      {/* TAB 1: Troubleshooting & Local Loopback Fix */}
      {activeGuideTab === 'troubleshooting' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2">
              How to Run the Local Relay on Your Machine (3 Quick Steps)
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              If you want the relay on your PC so OBS only encodes 1 stream and your PC relays it to Twitch, YouTube, and Kick:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs mb-2">
                    1
                  </span>
                  <h4 className="font-semibold text-white">Download the 1-Click Script</h4>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    Download the pre-configured <code className="text-indigo-300">start-multistream-relay.bat</code> file generated from your stream keys.
                  </p>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-slate-500">Requires FFmpeg on your PC</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs mb-2">
                    2
                  </span>
                  <h4 className="font-semibold text-white">Configure OBS to 127.0.0.1</h4>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    In OBS Settings &gt; Stream &gt; Custom:
                  </p>
                  <div className="mt-2 space-y-1 font-mono text-[10px]">
                    <div className="bg-slate-900 p-1 rounded text-slate-300">
                      Server: rtmp://127.0.0.1:1935/live
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-slate-300">
                      Key: {ingest.streamKey}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs mb-2">
                    3
                  </span>
                  <h4 className="font-semibold text-white">Double-Click and Stream!</h4>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    Double-click the .bat file to start the relay, then click <strong className="text-emerald-400">Start Streaming</strong> in OBS. OBS connects instantly with zero DNS errors!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Native OBS Multiple RTMP Output Plugin (No Server Needed) */}
      {activeGuideTab === 'plugin' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase mb-1">
              <Zap className="w-4 h-4" />
              <span>Recommended Native OBS Method</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Stream to Twitch, YouTube, and Kick directly inside OBS (obs-multi-rtmp)
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              If you don&apos;t want to run a separate relay server, you can install the official free OBS plugin called <strong className="text-white">Multiple RTMP Outputs (by sorayuki)</strong>. It adds a dock inside OBS where you stream to Twitch, YouTube, and Kick with 1 click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-indigo-400 font-bold text-xs">Step 1</span>
              <h4 className="font-semibold text-white mt-1">Install Plugin</h4>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                Download the installer for <strong className="text-slate-200">obs-multi-rtmp</strong> from GitHub or OBS Forums (100% free &amp; open source).
              </p>
              <a
                href="https://github.com/sorayuki/obs-multi-rtmp/releases"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-2"
              >
                <span>Download Plugin</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-indigo-400 font-bold text-xs">Step 2</span>
              <h4 className="font-semibold text-white mt-1">Twitch in Settings</h4>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                In standard OBS Settings &gt; Stream, select <strong className="text-purple-400">Twitch</strong> and paste your Twitch key as primary.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-indigo-400 font-bold text-xs">Step 3</span>
              <h4 className="font-semibold text-white mt-1">Add YouTube &amp; Kick</h4>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                In the new &quot;Multiple Output&quot; panel in OBS, click <strong className="text-white">&quot;Add new target&quot;</strong>. Paste YouTube RTMP URL and your YouTube key, then add Kick!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-indigo-400 font-bold text-xs">Step 4</span>
              <h4 className="font-semibold text-white mt-1">Sync Start</h4>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                Set &quot;Sync start with OBS&quot; to Checked. Whenever you click Start Streaming in OBS, all 3 platforms go live simultaneously!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Standard RTMP Ingest */}
      {activeGuideTab === 'relay' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2">
              OBS Custom RTMP Settings
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              If running a relay server (locally or on a VPS), paste these exact credentials into OBS Studio:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block mb-1">Server URL:</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 text-xs">{ingest.serverUrl}</span>
                  <button
                    onClick={() => copyToClipboard(ingest.serverUrl, 'guide-srv')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedField === 'guide-srv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block mb-1">Stream Key:</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-400 text-xs truncate max-w-[200px]">{ingest.streamKey}</span>
                  <button
                    onClick={() => copyToClipboard(ingest.streamKey, 'guide-key')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedField === 'guide-key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={downloadObsProfile}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download OBS Profile (.ini)</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
