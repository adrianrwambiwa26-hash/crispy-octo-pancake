import React from 'react';
import { Cpu, Zap, Volume2, VolumeX, MessageSquareText, ShieldCheck, Flame } from 'lucide-react';
import { NetworkStats } from '../types/mining';
import { sound } from '../utils/sound';

interface HeaderProps {
  isMining: boolean;
  networkStats: NetworkStats | null;
  onOpenChat: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMining,
  networkStats,
  onOpenChat,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
              <span className="font-bold text-lg text-neutral-950 font-mono">₿</span>
            </div>
            {isMining && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white font-['Orbitron',sans-serif] text-base sm:text-lg">
                SatoshiForge <span className="text-amber-400">AI</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded">
                SHA-256d
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Continuous AI Hash Engine & Autonomous Miner
            </p>
          </div>
        </div>

        {/* Global Bitcoin Network Ticker */}
        <div className="hidden md:flex items-center gap-6 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">BTC/USD:</span>
            <span className="font-mono font-semibold text-emerald-400">
              ${networkStats ? networkStats.btcPriceUsd.toLocaleString() : '96,450'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Block:</span>
            <span className="font-mono text-neutral-200">
              #{networkStats?.blockHeight || 886420}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Global Diff:</span>
            <span className="font-mono text-neutral-200">
              {networkStats?.difficulty || '107.5 T'}
            </span>
          </div>
        </div>

        {/* Status & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mining state pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
              isMining
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isMining ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
              }`}
            />
            <span className="hidden sm:inline">{isMining ? 'MINING ACTIVE' : 'RIG STANDBY'}</span>
            <span className="sm:hidden">{isMining ? 'ACTIVE' : 'IDLE'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            title={soundEnabled ? 'Mute Audio Effects' : 'Unmute Audio Effects'}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* AI Copilot Chat Toggle */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-medium transition-all shadow-sm shadow-amber-500/10"
          >
            <MessageSquareText className="w-4 h-4" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
