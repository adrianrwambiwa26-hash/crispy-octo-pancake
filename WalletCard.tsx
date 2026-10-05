import React, { useState } from 'react';
import { Copy, Check, QrCode, ExternalLink, ShieldCheck, Wallet, ArrowUpRight, Coins } from 'lucide-react';
import { formatBtc, formatSatoshis } from '../utils/crypto';
import { sound } from '../utils/sound';

interface WalletCardProps {
  btcAddress: string;
  earnedSatoshis: number;
  earnedBtc: number;
  btcPriceUsd: number;
  validShares: number;
  blocksFound: number;
  onUpdateAddress: (newAddress: string) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  btcAddress,
  earnedSatoshis,
  earnedBtc,
  btcPriceUsd,
  validShares,
  blocksFound,
  onUpdateAddress,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempAddress, setTempAddress] = useState(btcAddress);

  const handleCopy = () => {
    navigator.clipboard.writeText(btcAddress);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usdValue = (earnedBtc * btcPriceUsd).toFixed(2);
  const payoutThreshold = 50000; // 50,000 satoshis threshold
  const payoutProgress = Math.min(100, (earnedSatoshis / payoutThreshold) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800/90 p-5 shadow-xl">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Destination Address details */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Miner Payout Target
            </span>
            <span className="text-xs text-neutral-400">Bitcoin Mainnet (P2PKH)</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-neutral-950/80 px-3.5 py-2 rounded-xl border border-neutral-800 font-mono text-sm sm:text-base text-amber-300 font-medium tracking-wide">
              <Wallet className="w-4 h-4 text-amber-500 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  className="bg-transparent border-b border-amber-500/50 text-amber-200 outline-none w-64 sm:w-80 font-mono text-xs sm:text-sm"
                />
              ) : (
                <span className="break-all select-all font-mono font-bold tracking-tight">
                  {btcAddress}
                </span>
              )}
            </div>

            {/* Quick Action buttons */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="Copy Bitcoin Address"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => {
                setShowQr(!showQr);
                sound.playClick();
              }}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">QR</span>
            </button>

            {isEditing ? (
              <button
                onClick={() => {
                  onUpdateAddress(tempAddress.trim() || '1KAannFXUtEN1UooYvWjhHaT41z8iRuuKY');
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => {
                  setTempAddress(btcAddress);
                  setIsEditing(true);
                }}
                className="text-xs text-neutral-500 hover:text-neutral-400 underline decoration-dotted ml-1"
              >
                Change
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-400">
            All coinbase rewards & pool shares generated by this rig are cryptographically destined to this wallet address.
          </p>
        </div>

        {/* Right: Balances & Cumulative Rewards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4 shrink-0">
          {/* Satoshis Mined */}
          <div className="bg-neutral-950/60 rounded-xl p-3.5 border border-neutral-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Mined Sats
            </span>
            <div className="mt-1">
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                {formatSatoshis(earnedSatoshis)}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                {formatBtc(earnedBtc)} BTC
              </div>
            </div>
          </div>

          {/* USD Value */}
          <div className="bg-neutral-950/60 rounded-xl p-3.5 border border-neutral-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Est. USD Value
            </span>
            <div className="mt-1">
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                ${usdValue}
              </div>
              <div className="text-[11px] text-neutral-400">
                @ ${btcPriceUsd.toLocaleString()} / BTC
              </div>
            </div>
          </div>

          {/* Shares / Blocks */}
          <div className="col-span-2 sm:col-span-1 bg-neutral-950/60 rounded-xl p-3.5 border border-neutral-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Shares / Blocks
            </span>
            <div className="mt-1">
              <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-baseline gap-1.5">
                <span>{validShares}</span>
                <span className="text-xs font-normal text-neutral-500">shares</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                {blocksFound} Block{blocksFound === 1 ? '' : 's'} Solved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout batch progress bar */}
      <div className="mt-4 pt-3 border-t border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">Next Automatic Pool Payout Batch:</span>
          <span className="font-mono text-neutral-200">
            {formatSatoshis(earnedSatoshis)} / {formatSatoshis(payoutThreshold)} sats
          </span>
          <span className="text-neutral-500">({payoutProgress.toFixed(1)}%)</span>
        </div>
        <div className="w-full sm:w-48 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${payoutProgress}%` }}
          />
        </div>
      </div>

      {/* QR Code Popover */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                Bitcoin Payout Address
              </h3>
              <button
                onClick={() => setShowQr(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl flex items-center justify-center">
              {/* QR Code visual representation via SVG */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=bitcoin:${btcAddress}`}
                alt={`QR code for ${btcAddress}`}
                className="w-48 h-48"
              />
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-center font-mono text-xs text-amber-300 break-all select-all">
              {btcAddress}
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowQr(false)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
