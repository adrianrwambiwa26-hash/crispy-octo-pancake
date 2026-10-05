import React, { useState } from 'react';
import { Box, ChevronDown, ChevronRight, FileCode, GitFork, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import { BlockHeader, MempoolTx } from '../types/mining';
import { formatBtc, formatSatoshis } from '../utils/crypto';

interface BlockInspectorProps {
  blockHeader: BlockHeader;
  payoutAddress: string;
  blockRewardBtc: number;
  mempoolTxs: MempoolTx[];
  blockHeight: number;
}

export const BlockInspector: React.FC<BlockInspectorProps> = ({
  blockHeader,
  payoutAddress,
  blockRewardBtc,
  mempoolTxs,
  blockHeight,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const totalFeesSatoshis = mempoolTxs.reduce((sum, tx) => sum + tx.feeSatoshis, 0);
  const totalRewardSatoshis = Math.round(blockRewardBtc * 100000000) + totalFeesSatoshis;

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg transition-all">
      {/* Header bar / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                Candidate Block #{blockHeight.toLocaleString()} Inspector
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                80-Byte Header
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Coinbase Tx destination: <span className="font-mono text-amber-400 font-semibold">{payoutAddress.slice(0, 12)}...{payoutAddress.slice(-6)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-mono font-bold text-emerald-400">
              {formatBtc(totalRewardSatoshis / 100000000)} BTC
            </div>
            <div className="text-[10px] text-neutral-500">Block Subsidy + Fees</div>
          </div>
          <div className="p-1 rounded-lg bg-neutral-800 text-neutral-400">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded Inspector */}
      {isOpen && (
        <div className="p-5 border-t border-neutral-800 space-y-5 bg-neutral-950/60 font-mono text-xs">
          {/* Header 80 bytes breakdown */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-sans font-semibold flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              Bitcoin 80-Byte Block Header Structure
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Version */}
              <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800">
                <div className="text-neutral-500 text-[10px] uppercase">Version (4 bytes LE)</div>
                <div className="text-white font-bold mt-0.5">
                  0x{blockHeader.version.toString(16).padStart(8, '0')} (BIP9 versionbits)
                </div>
              </div>

              {/* Timestamp */}
              <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800">
                <div className="text-neutral-500 text-[10px] uppercase">Timestamp (4 bytes LE)</div>
                <div className="text-white font-bold mt-0.5">
                  {blockHeader.timestamp} ({new Date(blockHeader.timestamp * 1000).toUTCString()})
                </div>
              </div>

              {/* Prev Block Hash */}
              <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800 md:col-span-2">
                <div className="text-neutral-500 text-[10px] uppercase">Previous Block Hash (32 bytes)</div>
                <div className="text-amber-300 font-bold mt-0.5 break-all select-all text-[11px]">
                  {blockHeader.prevBlockHash}
                </div>
              </div>

              {/* Merkle Root */}
              <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800 md:col-span-2">
                <div className="text-neutral-500 text-[10px] uppercase">Merkle Root (32 bytes)</div>
                <div className="text-cyan-300 font-bold mt-0.5 break-all select-all text-[11px]">
                  {blockHeader.merkleRoot}
                </div>
              </div>

              {/* Bits & Extranonce */}
              <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800">
                <div className="text-neutral-500 text-[10px] uppercase">Compact Bits Target (4 bytes)</div>
                <div className="text-white font-bold mt-0.5">0x{blockHeader.bits}</div>
              </div>

              <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800">
                <div className="text-neutral-500 text-[10px] uppercase">Coinbase Extranonce</div>
                <div className="text-amber-400 font-bold mt-0.5">{blockHeader.extranonce}</div>
              </div>
            </div>
          </div>

          {/* Coinbase Transaction Details */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-['Orbitron',sans-serif]">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Coinbase Transaction (Tx #0)
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                +{formatBtc(totalRewardSatoshis / 100000000)} BTC
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-500 text-[11px]">Reward Recipient:</span>
                <div className="font-mono text-amber-200 font-bold break-all mt-0.5">
                  {payoutAddress}
                </div>
              </div>
              <div>
                <span className="text-neutral-500 text-[11px]">Reward Breakdown:</span>
                <div className="text-neutral-300 mt-0.5">
                  Block Subsidy: <span className="font-mono text-white">{blockRewardBtc} BTC</span> + Fees:{' '}
                  <span className="font-mono text-emerald-400">{formatSatoshis(totalFeesSatoshis)} sats</span>
                </div>
              </div>
            </div>
          </div>

          {/* Included Mempool Transactions */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-sans font-semibold flex items-center justify-between">
              <span>Candidate Mempool Transactions ({mempoolTxs.length})</span>
              <span className="text-neutral-500 font-mono">Fee Priority Ordering</span>
            </div>

            <div className="divide-y divide-neutral-900 border border-neutral-800 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
              {mempoolTxs.map((tx, idx) => (
                <div
                  key={tx.txid}
                  className="px-3 py-1.5 bg-neutral-900/40 hover:bg-neutral-900 flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-neutral-500 w-6">#{idx + 1}</span>
                    <span className="text-neutral-300 truncate font-mono">
                      {tx.txid.slice(0, 16)}...{tx.txid.slice(-8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-neutral-400 font-mono">{formatBtc(tx.amountBtc)} BTC</span>
                    <span className="text-emerald-400 font-mono">+{formatSatoshis(tx.feeSatoshis)} sats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
