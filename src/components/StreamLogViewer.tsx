import React from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';
import { StreamLog } from '../types/stream';

interface StreamLogViewerProps {
  logs: StreamLog[];
  onClear?: () => void;
}

export const StreamLogViewer: React.FC<StreamLogViewerProps> = ({ logs }) => {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Relay Dispatch &amp; Event Logs</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {logs.length} events logged
        </span>
      </div>

      <div className="p-3 bg-slate-950/70 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-slate-600 py-4 text-center">No logs recorded yet.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
              <span
                className={`px-1 rounded text-[10px] font-semibold shrink-0 ${
                  log.source === 'OBS Ingest'
                    ? 'bg-blue-500/20 text-blue-400'
                    : log.source === 'Twitch'
                    ? 'bg-purple-500/20 text-purple-400'
                    : log.source === 'YouTube'
                    ? 'bg-red-500/20 text-red-400'
                    : log.source === 'Kick'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                {log.source}
              </span>
              <span
                className={
                  log.level === 'error'
                    ? 'text-rose-400'
                    : log.level === 'warn'
                    ? 'text-amber-400'
                    : log.level === 'success'
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
