import React, { useState } from 'react';
import { CheckCircle2, Award, History, ArrowUpRight, Copy, Check, ExternalLink } from 'lucide-react';
import { HashSample, MinedBlock, PayoutRecord } from '../types/mining';
import { formatBtc, formatSatoshis } from '../utils/crypto';
import { sound } from '../utils/sound';

interface SharesHistoryProps {
  shares: HashSample[];
  blocks: MinedBlock[];
  payouts: PayoutRecord[];
  payoutAddress: string;
}

export const SharesHistory: React.FC<SharesHistoryProps> = ({
  shares,
  blocks,
  payouts,
  payoutAddress,
}) => {
  const [activeTab, setActiveTab] = useState<'shares' | 'blocks' | 'payouts'>('shares');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    sound.playClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('shares');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'shares'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Valid Shares ({shares.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('blocks');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'blocks'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Solved Blocks ({blocks.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('payouts');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'payouts'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Payout Ledger ({payouts.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-neutral-500 hidden sm:inline">
          Destination: {payoutAddress.slice(0, 8)}...{payoutAddress.slice(-4)}
        </span>
      </div>

      {/* Tab: Valid Shares */}
      {activeTab === 'shares' && (
        <div className="space-y-2">
          {shares.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No valid pool shares found yet in this session. Start the miner and watch for hashes meeting target difficulty!
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/60 max-h-64 overflow-y-auto font-mono text-xs">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="py-2 px-3 flex items-center justify-between hover:bg-neutral-950/40 rounded-lg transition-colors gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-bold shrink-0">✓ ACCEPTED</span>
                    <span className="text-neutral-500 text-[11px] shrink-0">
                      [{new Date(share.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className="text-neutral-400 truncate">
                      Hash: <span className="text-white">{share.hash.slice(0, 18)}...{share.hash.slice(-8)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-neutral-400 text-[11px]">
                      Nonce: 0x{share.nonce.toString(16).padStart(8, '0')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {share.leadingZeros} Zeros
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Solved Blocks */}
      {activeTab === 'blocks' && (
        <div className="space-y-3">
          {blocks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs space-y-1">
              <Award className="w-8 h-8 text-neutral-600 mx-auto" />
              <p>No full blocks solved yet.</p>
              <p className="text-[11px] text-neutral-600">
                Solving a full block awards the 3.125 BTC subsidy directly to address {payoutAddress}.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="p-3.5 bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-950 border border-amber-500/30 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 font-['Orbitron',sans-serif] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      Block #{block.blockHeight.toLocaleString()} SOLVED!
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      +{block.rewardBtc} BTC ({formatSatoshis(block.rewardSatoshis)} sats)
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-400 break-all">
                    Hash: <span className="text-white">{block.hash}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                    <span>Solved at {new Date(block.timestamp).toLocaleString()}</span>
                    <span>Nonce: 0x{block.nonce.toString(16).padStart(8, '0')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Payout Ledger */}
      {activeTab === 'payouts' && (
        <div className="space-y-2">
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              Payouts are batched and automatically dispatched to {payoutAddress} as rewards accrue.
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/60 max-h-64 overflow-y-auto font-mono text-xs">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="py-2.5 px-3 flex items-center justify-between hover:bg-neutral-950/40 rounded-lg transition-colors gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {payout.status}
                    </span>
                    <span className="text-neutral-400 truncate">
                      TX: {payout.txid.slice(0, 16)}...{payout.txid.slice(-8)}
                    </span>
                    <button
                      onClick={() => handleCopy(payout.txid, payout.id)}
                      className="p-1 hover:text-white text-neutral-500"
                      title="Copy TXID"
                    >
                      {copiedId === payout.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-emerald-400 font-bold">
                      +{formatSatoshis(payout.amountSatoshis)} sats
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(payout.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
