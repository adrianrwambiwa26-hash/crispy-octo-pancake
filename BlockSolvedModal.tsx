import React from 'react';
import { Award, CheckCircle2, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { MinedBlock } from '../types/mining';
import { formatBtc, formatSatoshis } from '../utils/crypto';
import { sound } from '../utils/sound';

interface BlockSolvedModalProps {
  block: MinedBlock | null;
  onClose: () => void;
}

export const BlockSolvedModal: React.FC<BlockSolvedModalProps> = ({ block, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!block) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(block.hash);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 text-center space-y-6 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none -mt-32" />

        <div className="relative z-10 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 border border-amber-300">
            <Award className="w-9 h-9 text-neutral-950" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Proof of Work Solved
            </div>
            <h2 className="text-2xl font-black text-white font-['Orbitron',sans-serif]">
              BLOCK #{block.blockHeight.toLocaleString()} MINED!
            </h2>
            <p className="text-xs text-neutral-400">
              Cryptographic double-SHA256 solution discovered below network target!
            </p>
          </div>
        </div>

        {/* Reward Card */}
        <div className="bg-neutral-900/80 border border-amber-500/30 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Coinbase Subsidy + Tx Fees:</span>
            <span className="font-mono text-xl font-bold text-amber-400">
              +{formatBtc(block.rewardBtc)} BTC
            </span>
          </div>

          <div className="text-xs space-y-1 pt-2 border-t border-neutral-800">
            <div className="text-neutral-400">Credited Directly To:</div>
            <div className="font-mono font-bold text-white bg-neutral-950 p-2 rounded-lg border border-neutral-800 break-all select-all text-xs">
              {block.payoutAddress}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <span className="text-neutral-500 text-[10px]">Winning Nonce:</span>
              <div className="font-mono text-neutral-200">
                0x{block.nonce.toString(16).padStart(8, '0')}
              </div>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px]">Satoshi Value:</span>
              <div className="font-mono text-emerald-400 font-bold">
                {formatSatoshis(block.rewardSatoshis)} sats
              </div>
            </div>
          </div>
        </div>

        {/* Block Hash */}
        <div className="space-y-1 text-left">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Discovered Block Hash:</span>
            <button
              onClick={handleCopy}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 font-mono text-[11px] text-emerald-400 break-all select-all">
            {block.hash}
          </div>
        </div>

        {/* Close Button */}
        <div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Acknowledge & Continue Hashing
          </button>
        </div>
      </div>
    </div>
  );
};
