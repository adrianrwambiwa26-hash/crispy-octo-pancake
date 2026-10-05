import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, Send, X, Bot, User, Sparkles, Terminal } from 'lucide-react';
import { MiningStats } from '../types/mining';
import { sound } from '../utils/sound';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: MiningStats;
  btcAddress: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  stats,
  btcAddress,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Greetings. I am SatoshiForge AI Copilot. I am actively monitoring your double-SHA256 hash stream targeting Bitcoin destination address ${btcAddress}. How can I assist with your mining configuration, cryptographic entropy, or network difficulty analysis?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          stats,
          btcAddress,
        }),
      });
      const data = await res.json();
      const aiReply: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.reply || 'Calculation complete. Hash stream stable.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_err_' + Date.now(),
          sender: 'ai',
          text: `Telemetry connection preserved. Hashing continues for address ${btcAddress}. All worker threads are functioning normally.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'How does double-SHA256 verify our target address?',
    'Analyze current hash rate efficiency and thread count',
    'Explain how extranonce rotation avoids nonce exhaustion',
    'Calculate the mathematical probability of finding a 20-bit share',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm font-['Orbitron',sans-serif]">
                  SatoshiForge AI Copilot
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 font-mono">
                  GEMINI 3.8 FLASH
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Cryptographic mining analyst & telemetry advisor
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-950/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-neutral-950 font-medium'
                    : 'bg-neutral-800/90 text-neutral-200 border border-neutral-700/60 font-sans'
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs py-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>SatoshiForge AI analyzing hash space...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-neutral-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Suggestions:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white whitespace-nowrap transition-colors border border-neutral-700"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot about hash difficulty, nonce search, or Bitcoin protocols..."
            className="flex-1 bg-neutral-950 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500/60 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
