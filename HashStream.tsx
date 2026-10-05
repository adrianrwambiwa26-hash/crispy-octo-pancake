import React from 'react';
import { Activity, Hash, Zap, Sparkles, Terminal, Layers } from 'lucide-react';
import { HashSample } from '../types/mining';
import { formatHashrate } from '../utils/crypto';

interface HashStreamProps {
  isMining: boolean;
  hashrate: number;
  peakHashrate: number;
  totalHashes: number;
  currentNonce: number;
  recentSamples: HashSample[];
  activeThreads: number;
  targetLeadingZeros: number;
}

export const HashStream: React.FC<HashStreamProps> = ({
  isMining,
  hashrate,
  peakHashrate,
  totalHashes,
  currentNonce,
  recentSamples,
  activeThreads,
  targetLeadingZeros,
}) => {
  const latestSample = recentSamples[0];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Top telemetry cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Hashrate */}
        <div className="bg-neutral-950/80 rounded-xl p-3 border border-neutral-800/80">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Hash Velocity
            </span>
            {isMining && <span className="text-[10px] text-emerald-400 animate-pulse">LIVE</span>}
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-white">
            {formatHashrate(hashrate)}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">
            Peak: {formatHashrate(peakHashrate)}
          </div>
        </div>

        {/* Total Hashes Computed */}
        <div className="bg-neutral-950/80 rounded-xl p-3 border border-neutral-800/80">
          <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-amber-500" /> Total Hashes
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-amber-400">
            {totalHashes.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">
            Double SHA-256 rounds
          </div>
        </div>

        {/* Current Nonce Odometer */}
        <div className="bg-neutral-950/80 rounded-xl p-3 border border-neutral-800/80">
          <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Nonce Pointer
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold font-mono text-neutral-200 truncate">
            0x{currentNonce.toString(16).padStart(8, '0').toUpperCase()}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">
            {currentNonce.toLocaleString()} / 4.29B
          </div>
        </div>

        {/* Active Cores Activity */}
        <div className="bg-neutral-950/80 rounded-xl p-3 border border-neutral-800/80">
          <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Mining Cores
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold font-mono text-emerald-400">
            {isMining ? `${activeThreads} Parallel Threads` : 'Standby'}
          </div>
          <div className="flex gap-1 mt-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-xs transition-all ${
                  i < activeThreads && isMining
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-neutral-800'
                }`}
                style={{
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Terminal View: Live Double SHA-256 Stream */}
      <div className="bg-neutral-950 rounded-xl border border-neutral-800/90 overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="bg-neutral-900/90 px-4 py-2 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-neutral-300">LIVE SHA-256d HASH STREAM</span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400">Target Leading Zeros: {targetLeadingZeros}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            <span>REAL-TIME STREAM</span>
          </div>
        </div>

        {/* Active Prominent Hash Row */}
        <div className="p-4 bg-gradient-to-r from-neutral-950 via-neutral-900/50 to-neutral-950 border-b border-neutral-800/60">
          <div className="text-[10px] text-neutral-500 mb-1 flex items-center justify-between">
            <span>LATEST COMPUTED BLOCK HEADER HASH:</span>
            <span>NONCE: {latestSample ? `0x${latestSample.nonce.toString(16).padStart(8, '0')}` : '0x00000000'}</span>
          </div>
          <div className="text-xs sm:text-sm tracking-wider break-all select-all font-bold">
            {latestSample ? (
              <RenderHighlightedHash
                hash={latestSample.hash}
                targetZeros={targetLeadingZeros}
              />
            ) : (
              <span className="text-neutral-600">Waiting for mining rig to start... Click 'ENGAGE MINER RIG'</span>
            )}
          </div>
        </div>

        {/* Scrolling Hash Matrix / Recent Samples */}
        <div className="divide-y divide-neutral-900 max-h-48 overflow-y-auto select-none p-2 space-y-1">
          {recentSamples.length === 0 ? (
            <div className="py-6 text-center text-neutral-600 text-xs">
              Hashes will stream here continuously at 50,000+ hashes/sec when the rig starts.
            </div>
          ) : (
            recentSamples.slice(0, 8).map((sample) => (
              <div
                key={sample.id}
                className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded text-[11px] transition-colors ${
                  sample.isShare
                    ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold'
                    : 'text-neutral-400 hover:bg-neutral-900/40'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-neutral-500 text-[10px] w-12 shrink-0">
                    T#{sample.threadId}
                  </span>
                  <span className="text-neutral-500 text-[10px] w-20 shrink-0 font-mono">
                    N:{sample.nonce.toString(16).padStart(8, '0')}
                  </span>
                  <span className="truncate font-mono">
                    <RenderHighlightedHash
                      hash={sample.hash}
                      targetZeros={targetLeadingZeros}
                    />
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  {sample.leadingZeros > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {sample.leadingZeros} Zeros
                    </span>
                  )}
                  {sample.isShare && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500 text-neutral-950 font-extrabold uppercase">
                      SHARE VALID
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component to render glowing leading zeros
const RenderHighlightedHash: React.FC<{ hash: string; targetZeros: number }> = ({
  hash,
  targetZeros,
}) => {
  let leadingZerosCount = 0;
  for (let i = 0; i < hash.length; i++) {
    if (hash[i] === '0') leadingZerosCount++;
    else break;
  }

  const zerosPart = hash.slice(0, leadingZerosCount);
  const remainderPart = hash.slice(leadingZerosCount);

  return (
    <span>
      {zerosPart && (
        <span
          className={`font-extrabold ${
            leadingZerosCount >= targetZeros
              ? 'text-emerald-400 underline decoration-emerald-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
              : 'text-emerald-500'
          }`}
        >
          {zerosPart}
        </span>
      )}
      <span className="text-neutral-400">{remainderPart}</span>
    </span>
  );
};
