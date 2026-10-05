import React from 'react';
import { Play, Square, RotateCcw, Cpu, Gauge, Sliders, Sparkles } from 'lucide-react';
import { DifficultyPreset, DifficultyConfig } from '../types/mining';
import { sound } from '../utils/sound';

export const DIFFICULTY_PRESETS: Record<DifficultyPreset, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Demo Share (16-bit)',
    description: 'Fast difficulty (~4 leading zeros). Generates valid pool shares every few seconds.',
    leadingHexZeros: 4,
    targetHex: '0000ffff00000000000000000000000000000000000000000000000000000000',
    targetBits: '1f00ffff',
    shareRewardSatoshis: 125,
  },
  medium: {
    id: 'medium',
    name: 'Stratum Pool (20-bit)',
    description: 'Standard pool share difficulty (5 leading zeros). Requires ~1,048,576 hashes per share.',
    leadingHexZeros: 5,
    targetHex: '00000fff00000000000000000000000000000000000000000000000000000000',
    targetBits: '1e0fffff',
    shareRewardSatoshis: 2000,
  },
  hard: {
    id: 'hard',
    name: 'High Target (24-bit)',
    description: 'Rigorous difficulty (6 leading zeros). Requires ~16.7 million hashes per share.',
    leadingHexZeros: 6,
    targetHex: '000000ff00000000000000000000000000000000000000000000000000000000',
    targetBits: '1d00ffff',
    shareRewardSatoshis: 32000,
  },
  mainnet: {
    id: 'mainnet',
    name: 'Mainnet Reality (75-bit)',
    description: 'Current real Bitcoin network target (~19 leading zeros). Astronomical odds to highlight ASIC scale.',
    leadingHexZeros: 19,
    targetHex: '000000000000000000024a1b0000000000000000000000000000000000000000',
    targetBits: '17024a1b',
    shareRewardSatoshis: 312500000,
  },
};

interface MiningControlsProps {
  isMining: boolean;
  onToggleMining: () => void;
  onResetStats: () => void;
  threads: number;
  onThreadsChange: (threads: number) => void;
  currentDifficulty: DifficultyPreset;
  onDifficultyChange: (preset: DifficultyPreset) => void;
}

export const MiningControls: React.FC<MiningControlsProps> = ({
  isMining,
  onToggleMining,
  onResetStats,
  threads,
  onThreadsChange,
  currentDifficulty,
  onDifficultyChange,
}) => {
  return (
    <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Main Action Start/Stop Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onToggleMining();
            }}
            className={`group relative px-6 py-3.5 rounded-xl font-bold font-mono tracking-wide text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 ${
              isMining
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-extrabold shadow-amber-500/20'
            }`}
          >
            {isMining ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>PAUSE MINING RIG</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>ENGAGE MINER RIG</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onResetStats();
            }}
            className="p-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/80 text-neutral-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Reset Session Counters"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Worker Threads / Hardware Allocation */}
        <div className="flex items-center gap-3 bg-neutral-950/70 px-4 py-2 rounded-xl border border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Cpu className="w-4 h-4 text-amber-500" />
            <span>Threads:</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 4, 8].map((t) => (
              <button
                key={t}
                onClick={() => {
                  sound.playClick();
                  onThreadsChange(t);
                }}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                  threads === t
                    ? 'bg-amber-500 text-neutral-950 shadow-sm shadow-amber-500/30'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Target Difficulty Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-amber-500" /> Target Difficulty Level
          </span>
          <span className="font-mono text-amber-400/90 text-[11px]">
            Leading Zeros Target: {DIFFICULTY_PRESETS[currentDifficulty].leadingHexZeros} Hex
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(DIFFICULTY_PRESETS) as DifficultyPreset[]).map((key) => {
            const config = DIFFICULTY_PRESETS[key];
            const isSelected = currentDifficulty === key;
            return (
              <button
                key={key}
                onClick={() => {
                  sound.playClick();
                  onDifficultyChange(key);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-sm shadow-amber-500/10'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/40'
                }`}
              >
                <div className="font-bold text-xs truncate text-white">{config.name}</div>
                <div className="text-[10px] text-neutral-500 mt-1 line-clamp-1">
                  {config.description}
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
