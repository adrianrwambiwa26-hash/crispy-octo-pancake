import React from 'react';
import { Bot, Sparkles, RefreshCw, Cpu, CheckCircle2, TrendingUp, ShieldAlert, Binary } from 'lucide-react';
import { AIOptimizerState } from '../types/mining';
import { sound } from '../utils/sound';

interface AIOptimizerPanelProps {
  aiState: AIOptimizerState;
  onTriggerRecalculate: () => void;
  onToggleAutoOptimize: () => void;
  btcAddress: string;
}

export const AIOptimizerPanel: React.FC<AIOptimizerPanelProps> = ({
  aiState,
  onTriggerRecalculate,
  onToggleAutoOptimize,
  btcAddress,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800/90 p-5 space-y-5 shadow-xl">
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-['Orbitron',sans-serif]">
                AI Autonomous Hash Engine
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                GEMINI 3.8 FLASH
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Continuously optimizing nonce partitioning, extranonce rotation & entropy
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          {/* Continuous Auto-Calculate Switch */}
          <div className="flex items-center gap-2 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800">
            <label className="text-xs text-neutral-400 cursor-pointer select-none">
              Auto-Tune AI
            </label>
            <button
              onClick={() => {
                sound.playClick();
                onToggleAutoOptimize();
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                aiState.isAutoOptimizing ? 'bg-cyan-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  aiState.isAutoOptimizing ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Trigger button */}
          <button
            onClick={() => {
              sound.playClick();
              onTriggerRecalculate();
            }}
            disabled={aiState.isCalculating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiState.isCalculating ? 'animate-spin' : ''}`} />
            <span>{aiState.isCalculating ? 'Computing...' : 'Recalculate Hashes'}</span>
          </button>
        </div>
      </div>

      {/* Real-time AI Analysis Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Entropy Score */}
        <div className="bg-neutral-950/80 rounded-xl p-3.5 border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Binary className="w-3.5 h-3.5 text-cyan-400" /> Hash Entropy
            </span>
            <span className="text-cyan-400 font-mono font-bold">{aiState.entropyScore}%</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${aiState.entropyScore}%` }}
              />
            </div>
            <div className="text-[10px] text-neutral-500 flex justify-between">
              <span>Bit Diffusion</span>
              <span>Near-Uniform</span>
            </div>
          </div>
        </div>

        {/* AI Extranonce Seed */}
        <div className="bg-neutral-950/80 rounded-xl p-3.5 border border-neutral-800/80 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-amber-400" /> Active Extranonce
          </div>
          <div className="mt-1">
            <div className="text-base font-mono font-bold text-amber-300 truncate">
              {aiState.recommendedExtranonce}
            </div>
            <div className="text-[10px] text-neutral-500">
              Rotates Merkle Root into new 2^32 nonce space
            </div>
          </div>
        </div>

        {/* Neural Status */}
        <div className="bg-neutral-950/80 rounded-xl p-3.5 border border-neutral-800/80 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> AI Optimization
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{aiState.status}</span>
            </div>
            <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
              Target: {btcAddress.slice(0, 10)}...{btcAddress.slice(-6)}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assessment & Directives */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Neural Assessment
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              Last updated: {new Date(aiState.lastCalculated).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {aiState.assessment}
          </p>
        </div>

        {/* AI Tactical Directives */}
        <div className="bg-neutral-950/60 rounded-xl p-3.5 border border-neutral-800/60">
          <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold mb-2">
            Active Tactical Directives:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {aiState.aiDirectives.map((directive, idx) => (
              <div
                key={idx}
                className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800 text-[11px] text-neutral-300 flex items-start gap-2"
              >
                <span className="text-cyan-400 font-mono font-bold shrink-0">#{idx + 1}</span>
                <span className="line-clamp-2">{directive}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Math & Protocol Insight */}
        {aiState.mathInsight && (
          <div className="text-[11px] text-neutral-400 bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-800/40 font-mono flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">∑ INSIGHT:</span>
            <span>{aiState.mathInsight}</span>
          </div>
        )}
      </div>
    </div>
  );
};
