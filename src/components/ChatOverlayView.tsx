import React, { useEffect, useState } from 'react';
import { StreamChatMessage, PlatformId } from '../types/stream';

interface ChatOverlayViewProps {
  chatMessages: StreamChatMessage[];
}

export const ChatOverlayView: React.FC<ChatOverlayViewProps> = ({ chatMessages }) => {
  const [messages, setMessages] = useState<StreamChatMessage[]>(chatMessages);

  useEffect(() => {
    setMessages(chatMessages.slice(-12));
  }, [chatMessages]);

  const getBadge = (p: PlatformId) => {
    switch (p) {
      case 'twitch':
        return <span className="bg-[#9146FF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">TWITCH</span>;
      case 'youtube':
        return <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">YOUTUBE</span>;
      case 'kick':
        return <span className="bg-[#53FC18] text-black text-[10px] font-bold px-1.5 py-0.5 rounded">KICK</span>;
      default:
        return <span className="bg-slate-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>;
    }
  };

  return (
    <div className="fixed inset-0 p-4 flex flex-col justify-end bg-transparent pointer-events-none overflow-hidden font-sans">
      <div className="space-y-2 max-w-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-200 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 shadow-2xl text-xs text-white"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {getBadge(msg.platform)}
              <span
                className="font-bold tracking-tight"
                style={{ color: msg.userColor || '#38bdf8' }}
              >
                {msg.username}
              </span>
              <span className="text-[10px] text-slate-500 font-mono ml-auto">
                {msg.timestamp}
              </span>
            </div>
            <p className="text-slate-200 leading-snug break-words pl-0.5">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
