import React from 'react';
import { Target, Zap, ShieldCheck, CheckCircle, Sparkles, Play, Award, Flame, FastForward } from 'lucide-react';
import { formatBtc, formatSatoshis } from '../utils/crypto';
import { sound } from '../utils/sound';

interface TargetProgressBannerProps {
  earnedBtc: number;
  earnedSatoshis: number;
  targetBtc: number;
  blocksFound: number;
  btcAddress: string;
  btcPriceUsd: number;
  autoAcknowledge: boolean;
  onToggleAutoAcknowledge: () => void;
  speedMultiplier: number;
  onChangeSpeedMultiplier: (mult: number) => void;
  isMining: boolean;
  onStartMining: () => void;
}

export const TargetProgressBanner: React.FC<TargetProgressBannerProps> = ({
  earnedBtc,
  earnedSatoshis,
  targetBtc,
  blocksFound,
  btcAddress,
  btcPriceUsd,
  autoAcknowledge,
  onToggleAutoAcknowledge,
  speedMultiplier,
  onChangeSpeedMultiplier,
  isMining,
  onStartMining,
}) => {
  const percent = Math.min(100, (earnedBtc / targetBtc) * 100);
  const remainingBtc = Math.max(0, targetBtc - earnedBtc);
  const blocksRemaining = Math.ceil(remainingBtc / 3.125);
  const targetUsdValue = (targetBtc * btcPriceUsd).toLocaleString();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 border border-amber-500/40 p-5 shadow-2xl space-y-4">
      {/* Glow */}
      <div className="absolute top-0 left-0 w-80 h-full bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none" />

      {/* Top row: Target header & Auto-Ack switch */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Target className="w-3.5 h-3.5" />
              Active Operation Target: 1,000 BTC
            </span>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              ~${targetUsdValue} USD Goal
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white font-['Orbitron',sans-serif] flex items-center gap-2">
            Continuous Operation Until <span className="text-amber-400">1,000.00 BTC</span>
          </h3>

          <p className="text-xs text-neutral-400">
            Autonomous mode automatically acknowledges solved blocks & valid shares, depositing rewards directly to{' '}
            <span className="font-mono text-amber-300 font-semibold">{btcAddress.slice(0, 12)}...{btcAddress.slice(-6)}</span> without halting.
          </p>
        </div>

        {/* Right controls: Auto-Acknowledge & Simulation Speed */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Auto-Acknowledge toggle */}
          <div className="flex items-center gap-2 bg-neutral-950/80 px-3.5 py-2 rounded-xl border border-neutral-800">
            <div className="text-left">
              <div className="text-xs font-semibold text-white flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Acknowledge
              </div>
              <div className="text-[10px] text-neutral-400">
                {autoAcknowledge ? 'Non-stop hashing' : 'Pause on block'}
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onToggleAutoAcknowledge();
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ml-1 ${
                autoAcknowledge ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoAcknowledge ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1.5 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
            <span className="text-neutral-400 flex items-center gap-1">
              <FastForward className="w-3.5 h-3.5 text-amber-400" /> Speed:
            </span>
            {[1, 5, 25, 100].map((m) => (
              <button
                key={m}
                onClick={() => {
                  sound.playClick();
                  onChangeSpeedMultiplier(m);
                }}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                  speedMultiplier === m
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>

          {!isMining && (
            <button
              onClick={() => {
                sound.playClick();
                onStartMining();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Numeric Stats */}
      <div className="space-y-2 pt-1">
        <div className="flex items-end justify-between text-xs font-mono">
          <div>
            <span className="text-neutral-400">Current Progress:</span>{' '}
            <span className="text-lg sm:text-xl font-bold text-amber-400">
              {formatBtc(earnedBtc)} BTC
            </span>{' '}
            <span className="text-neutral-500 text-xs">/ 1,000.00000000 BTC</span>
          </div>

          <div className="text-right">
            <span className="text-emerald-400 font-bold text-sm sm:text-base">
              {percent.toFixed(2)}%
            </span>{' '}
            <span className="text-neutral-500 hidden sm:inline">
              ({remainingBtc.toFixed(2)} BTC / ~{blocksRemaining} blocks left)
            </span>
          </div>
        </div>

        {/* Outer Bar */}
        <div className="w-full bg-neutral-950 rounded-full h-3.5 p-0.5 border border-neutral-800 overflow-hidden relative">
          <div
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300 relative"
            style={{ width: `${Math.max(1, percent)}%` }}
          >
            {/* Shimmer line */}
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-sans">
          <span>
            {blocksFound} block{blocksFound === 1 ? '' : 's'} solved (~3.125 BTC each)
          </span>
          <span className="text-emerald-400 font-mono font-medium">
            Est. Progress Value: ${(earnedBtc * btcPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </span>
        </div>
      </div>
    </div>
  );
};
