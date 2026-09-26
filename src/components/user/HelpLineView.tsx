import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Headphones,
  ShieldCheck,
  CheckCheck,
  Clock,
  User,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { SupportChatMessage } from '../../types';

interface HelpLineViewProps {
  onBack: () => void;
}

export const HelpLineView: React.FC<HelpLineViewProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const uid = currentUser ? currentUser.uid : '';

  const refreshChat = () => {
    if (uid) {
      setMessages(db.getSupportMessages(uid));
    }
  };

  useEffect(() => {
    refreshChat();
    const unsub = db.subscribe(() => {
      refreshChat();
    });
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    setSending(true);
    db.sendSupportMessage(currentUser.uid, inputText.trim());
    setInputText('');
    setSending(false);
    refreshChat();
  };

  return (
    <div className="min-h-screen bg-[#060c1c] text-white flex flex-col justify-between pb-4">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#091226]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#091226]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-1">
                <span>BD TAKA হেল্প লাইন</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </h2>
              <span className="text-[10px] text-emerald-400 block font-medium">
                অফিসিয়াল কাস্টমার সাপোর্ট
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshChat}
          className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white"
          title="রিফ্রেশ"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-md mx-auto w-full">
        {/* Welcome Notice */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs space-y-1">
          <p className="font-semibold text-slate-300">
            👋 স্বাগতম! ডিপোজিট, উইথড্র বা যেকোনো সমস্যায় আমাদের লিখুন।
          </p>
          <p className="text-[10px] text-slate-500">
            অফিসিয়াল টিম নিয়মিত বার্তা রিভিউ করে উত্তর প্রদান করবে।
          </p>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-sm'
                    : isSystem
                    ? 'bg-slate-900/90 border border-amber-500/30 text-amber-200 rounded-bl-sm'
                    : 'bg-[#121f3d] border border-blue-500/30 text-slate-100 rounded-bl-sm'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1 text-[10px] font-bold mb-1 opacity-80">
                    {isSystem ? (
                      <>
                        <Bot className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-300">অটোমেটিক প্রাপ্তি স্বীকার</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-300">{msg.userName}</span>
                      </>
                    )}
                  </div>
                )}

                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                  <span>{msg.date.split(' ')[1] || msg.date}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                </div>
              </div>

              {/* Status pill for user messages */}
              {isUser && (
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 pr-1">
                  স্ট্যাটাস: {msg.status}
                </span>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="sticky bottom-0 z-30 bg-[#091226]/95 border-t border-slate-800 p-3 max-w-md mx-auto w-full">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="আপনার প্রশ্ন বা সমস্যা এখানে লিখুন..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
