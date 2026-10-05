import React from 'react';
import { Award, Trophy, CheckCircle2, ShieldCheck, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import { formatBtc, formatSatoshis } from '../utils/crypto';
import { sound } from '../utils/sound';

interface GoalReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  earnedBtc: number;
  btcAddress: string;
  btcPriceUsd: number;
  totalHashes: number;
  blocksFound: number;
}

export const GoalReachedModal: React.FC<GoalReachedModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  earnedBtc,
  btcAddress,
  btcPriceUsd,
  totalHashes,
  blocksFound,
}) => {
  if (!isOpen) return null;

  const usdValue = (earnedBtc * btcPriceUsd).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-amber-500/20 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none -mt-40" />

        <div className="relative z-10 space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/40 border-2 border-amber-300 animate-bounce">
            <Trophy className="w-10 h-10 text-neutral-950" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Award className="w-4 h-4" /> 1,000 BTC Target Achieved!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Orbitron',sans-serif]">
              GOAL REACHED: 1,000 BTC
            </h2>
            <p className="text-xs text-neutral-400">
              Autonomous mining operations have officially accrued the 1,000 BTC milestone to your destination address.
            </p>
          </div>
        </div>

        {/* Big Balance Card */}
        <div className="bg-neutral-900/90 border border-amber-500/40 rounded-2xl p-5 text-center space-y-2">
          <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
            Total Accrued Balance
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
            {formatBtc(earnedBtc)} BTC
          </div>
          <div className="text-sm font-mono text-emerald-400 font-bold">
            ≈ ${usdValue} USD Valuation
          </div>

          <div className="pt-3 mt-2 border-t border-neutral-800 text-left text-xs space-y-1">
            <div className="text-neutral-400 flex items-center justify-between">
              <span>Destination BTC Address:</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Target
              </span>
            </div>
            <div className="font-mono font-bold text-white bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 break-all select-all text-xs">
              {btcAddress}
            </div>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase">Blocks Solved</span>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {blocksFound}
            </div>
          </div>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase">Total Hashes</span>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {totalHashes.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <span>Continue Mining (Unlimited)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset 1,000 BTC Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
