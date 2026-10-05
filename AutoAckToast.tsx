import React, { useEffect } from 'react';
import { Award, CheckCircle2, ArrowUpRight, Zap, X } from 'lucide-react';
import { MinedBlock } from '../types/mining';
import { formatBtc, formatSatoshis } from '../utils/crypto';

interface AutoAckToastProps {
  block: MinedBlock | null;
  onDismiss: () => void;
}

export const AutoAckToast: React.FC<AutoAckToastProps> = ({ block, onDismiss }) => {
  useEffect(() => {
    if (!block) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);
    return () => clearTimeout(timer);
  }, [block, onDismiss]);

  if (!block) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-neutral-900/95 border border-amber-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Award className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 font-['Orbitron',sans-serif]">
              BLOCK #{block.blockHeight.toLocaleString()} SOLVED!
            </span>
            <button
              onClick={onDismiss}
              className="text-neutral-500 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-emerald-400">
            +{formatBtc(block.rewardBtc)} BTC ({formatSatoshis(block.rewardSatoshis)} sats)
          </div>

          <div className="text-[11px] text-neutral-400 truncate">
            Credited directly to:{' '}
            <span className="font-mono text-amber-200">{block.payoutAddress.slice(0, 10)}...{block.payoutAddress.slice(-6)}</span>
          </div>

          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono pt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Auto-acknowledged • Continuous hashing active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
