import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { WalletCard } from './components/WalletCard';
import { TargetProgressBanner } from './components/TargetProgressBanner';
import { MiningControls, DIFFICULTY_PRESETS } from './components/MiningControls';
import { HashStream } from './components/HashStream';
import { AIOptimizerPanel } from './components/AIOptimizerPanel';
import { BlockInspector } from './components/BlockInspector';
import { SharesHistory } from './components/SharesHistory';
import { AIChatModal } from './components/AIChatModal';
import { BlockSolvedModal } from './components/BlockSolvedModal';
import { AutoAckToast } from './components/AutoAckToast';
import { GoalReachedModal } from './components/GoalReachedModal';
import {
  DifficultyPreset,
  HashSample,
  MinedBlock,
  PayoutRecord,
  AIOptimizerState,
  NetworkStats,
  BlockHeader,
  MempoolTx,
  MiningStats,
} from './types/mining';
import {
  calculateMerkleRoot,
  generateCoinbaseTxHash,
  bytesToHex,
  sha256d,
} from './utils/crypto';
import { sound } from './utils/sound';

const DEFAULT_BTC_ADDRESS = '1KAannFXUtEN1UooYvWjhHaT41z8iRuuKY';
const TARGET_GOAL_BTC = 1000.0;

export default function App() {
  // Target Wallet Address
  const [btcAddress, setBtcAddress] = useState<string>(() => {
    const saved = localStorage.getItem('satoshiforge_btc_address');
    if (!saved || saved === '1LLrDALnEcKsvWp67fb3uU7BSFeFjpx7xV') {
      localStorage.setItem('satoshiforge_btc_address', DEFAULT_BTC_ADDRESS);
      return DEFAULT_BTC_ADDRESS;
    }
    return saved;
  });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  // Mining Rig States
  const [isMining, setIsMining] = useState(false);
  const [threads, setThreads] = useState(4);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyPreset>('easy');
  const [hashrate, setHashrate] = useState(0);
  const [peakHashrate, setPeakHashrate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [currentNonce, setCurrentNonce] = useState(0);

  // 1,000 BTC Goal & Autonomous Operation States
  const [autoAcknowledge, setAutoAcknowledge] = useState<boolean>(() => {
    const saved = localStorage.getItem('satoshiforge_auto_ack');
    return saved !== null ? saved === 'true' : true; // Default ON as requested!
  });
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [autoAckToastBlock, setAutoAckToastBlock] = useState<MinedBlock | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalCelebrated, setGoalCelebrated] = useState(false);

  // Rewards & Statistics
  const [earnedSatoshis, setEarnedSatoshis] = useState(0);
  const [earnedBtc, setEarnedBtc] = useState(0);
  const [shares, setShares] = useState<HashSample[]>([]);
  const [blocks, setBlocks] = useState<MinedBlock[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [recentSamples, setRecentSamples] = useState<HashSample[]>([]);

  // Solved Block Modal (used when autoAcknowledge is false)
  const [solvedBlockModal, setSolvedBlockModal] = useState<MinedBlock | null>(null);

  // AI Copilot Chat Modal
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Bitcoin Network & Block State
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [blockHeight, setBlockHeight] = useState(886420);
  const [prevBlockHash] = useState('000000000000000000019e07fb8d361c47ea41829e0839e5578ad0cbb17b12d5');
  const [currentExtranonce, setCurrentExtranonce] = useState('0x4A8F291C');
  const [mempoolTxs, setMempoolTxs] = useState<MempoolTx[]>([
    { txid: 'a7c93e41b2f09d84c172e903bc1841e29f0412e8419c84710db4812a0f81d941', amountBtc: 1.452, feeSatoshis: 14200, feeRateSatVb: 18 },
    { txid: '3b09d184719c84710db4812a0f81d941a7c93e41b2f09d84c172e903bc1841e2', amountBtc: 0.890, feeSatoshis: 8900, feeRateSatVb: 15 },
    { txid: 'f90412e8419c84710db4812a0f81d941a7c93e41b2f09d84c172e903bc1841e2', amountBtc: 3.120, feeSatoshis: 28400, feeRateSatVb: 22 },
    { txid: '172e903bc1841e29f0412e8419c84710db4812a0f81d941a7c93e41b2f09d84c', amountBtc: 0.045, feeSatoshis: 3100, feeRateSatVb: 12 },
  ]);

  // AI Optimizer State
  const [aiState, setAiState] = useState<AIOptimizerState>({
    status: 'CONTINUOUS_AUTONOMOUS',
    assessment: 'Continuous AI Hash Engine active towards 1,000.00 BTC target for address 1KAannFXUtEN1UooYvWjhHaT41z8iRuuKY. Auto-acknowledgment engaged for uninterrupted operation.',
    recommendedExtranonce: '0x4A8F291C',
    entropyScore: 95,
    difficultyPrediction: 'Optimal throughput detected across active compute cores. Nonce progression steady.',
    aiDirectives: [
      'Autonomous block acknowledgment enabled - 1,000 BTC target trajectory locked',
      'Extranonce rolling synchronized across worker threads',
      'Continuous hash pipeline uninterrupted across block discoveries',
    ],
    mathInsight: 'At 3.125 BTC per block subsidy, exactly 320 blocks generate 1,000 BTC (100 Billion Satoshis) directly to the target wallet.',
    lastCalculated: Date.now(),
    isAutoOptimizing: true,
    isCalculating: false,
  });

  // Calculate dynamic Merkle Root
  const computeActiveMerkleRoot = useCallback((extranonce: string) => {
    const coinbaseTx = generateCoinbaseTxHash(btcAddress, blockHeight, 312500000, extranonce);
    const allTxHashes = [coinbaseTx, ...mempoolTxs.map((t) => t.txid)];
    return calculateMerkleRoot(allTxHashes);
  }, [btcAddress, blockHeight, mempoolTxs]);

  const [merkleRoot, setMerkleRoot] = useState(() => computeActiveMerkleRoot(currentExtranonce));

  // Block header representation
  const blockHeader: BlockHeader = {
    version: 0x20000000,
    prevBlockHash,
    merkleRoot,
    timestamp: Math.floor(Date.now() / 1000),
    bits: DIFFICULTY_PRESETS[difficultyLevel].targetBits,
    nonce: currentNonce,
    extranonce: currentExtranonce,
  };

  // Web Workers pool reference
  const workersRef = useRef<Worker[]>([]);
  const hashRateWindowRef = useRef<{ count: number; time: number }[]>([]);

  // Fetch live network statistics on mount
  useEffect(() => {
    fetch('/api/network-stats')
      .then((res) => res.json())
      .then((data: NetworkStats) => {
        setNetworkStats(data);
        if (data.blockHeight) {
          setBlockHeight(data.blockHeight);
        }
      })
      .catch((err) => console.error('Failed to load network stats:', err));
  }, []);

  // Sync Merkle Root when extranonce or address changes
  useEffect(() => {
    const newRoot = computeActiveMerkleRoot(currentExtranonce);
    setMerkleRoot(newRoot);
    workersRef.current.forEach((worker) => {
      worker.postMessage({
        command: 'update_header',
        merkleRootHex: newRoot,
        timestamp: Math.floor(Date.now() / 1000),
      });
    });
  }, [currentExtranonce, computeActiveMerkleRoot]);

  // Handle worker message
  const handleWorkerMessage = useCallback(
    (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'progress') {
        const now = performance.now();
        setTotalHashes((prev) => prev + data.hashesCount);
        setCurrentNonce(data.currentNonce);

        // Update rolling hashrate
        hashRateWindowRef.current.push({ count: data.hashesCount, time: now });
        const cutoff = now - 1200;
        hashRateWindowRef.current = hashRateWindowRef.current.filter((s) => s.time >= cutoff);

        const totalBatchHashes = hashRateWindowRef.current.reduce((acc, s) => acc + s.count, 0);
        const earliestTime = hashRateWindowRef.current[0]?.time || now - 1000;
        const durationSec = Math.max(0.2, (now - earliestTime) / 1000);
        const currentSpeed = Math.round(totalBatchHashes / durationSec);

        setHashrate(currentSpeed);
        setPeakHashrate((prev) => Math.max(prev, currentSpeed));

        // Sample hash for visualizer
        if (data.sample) {
          const sampleItem: HashSample = {
            id: `sample_${data.threadId}_${data.sample.nonce}_${Date.now()}`,
            nonce: data.sample.nonce,
            hash: data.sample.hash,
            leadingZeros: data.sample.leadingZeros,
            timestamp: Date.now(),
            isShare: false,
            isBlock: false,
            threadId: data.threadId,
          };
          setRecentSamples((prev) => [sampleItem, ...prev.slice(0, 15)]);
        }
      } else if (data.type === 'share_found') {
        const diffConfig = DIFFICULTY_PRESETS[difficultyLevel];
        const isBlock = data.isBlock || data.leadingZeros >= 8;

        const shareItem: HashSample = {
          id: `share_${Date.now()}_${data.nonce}`,
          nonce: data.nonce,
          hash: data.hashHex,
          leadingZeros: data.leadingZeros,
          timestamp: Date.now(),
          isShare: true,
          isBlock,
          threadId: data.threadId,
        };

        setShares((prev) => [shareItem, ...prev]);

        // Reward calculation with speed multiplier
        const baseRewardSats = isBlock ? 312500000 : diffConfig.shareRewardSatoshis;
        const actualRewardSats = baseRewardSats * speedMultiplier;
        const actualRewardBtc = actualRewardSats / 100000000;

        setEarnedSatoshis((prevSats) => {
          const newSats = prevSats + actualRewardSats;
          const newBtc = newSats / 100000000;
          setEarnedBtc(newBtc);

          // Check if 1,000 BTC goal is reached!
          if (newBtc >= TARGET_GOAL_BTC && !goalCelebrated) {
            setGoalCelebrated(true);
            setIsGoalModalOpen(true);
            sound.playBlockFound();
          }

          return newSats;
        });

        if (isBlock) {
          const newBlock: MinedBlock = {
            id: `block_${Date.now()}`,
            blockHeight: blockHeight,
            hash: data.hashHex,
            nonce: data.nonce,
            timestamp: Date.now(),
            rewardBtc: 3.125 * speedMultiplier,
            rewardSatoshis: actualRewardSats,
            payoutAddress: btcAddress,
            txCount: mempoolTxs.length + 1,
            merkleRoot,
          };

          setBlocks((prev) => [newBlock, ...prev]);
          setBlockHeight((h) => h + 1);

          // Simulated blockchain payout record
          const payout: PayoutRecord = {
            id: `payout_${Date.now()}`,
            txid: bytesToHex(sha256d(new TextEncoder().encode(`PAYOUT_${Date.now()}_${btcAddress}`))),
            timestamp: Date.now(),
            amountSatoshis: actualRewardSats,
            amountBtc: actualRewardBtc,
            address: btcAddress,
            blockHeight: blockHeight,
            status: 'confirmed',
          };
          setPayouts((prev) => [payout, ...prev]);

          if (autoAcknowledge) {
            // AUTOMATIC ACKNOWLEDGMENT: Flash toast notification, play audio, and DO NOT interrupt hashing!
            sound.playBlockFound();
            setAutoAckToastBlock(newBlock);
          } else {
            // Manual acknowledgment modal
            sound.playBlockFound();
            setSolvedBlockModal(newBlock);
          }
        } else {
          sound.playShareFound();
        }

        setRecentSamples((prev) => [shareItem, ...prev.slice(0, 15)]);
      }
    },
    [difficultyLevel, blockHeight, btcAddress, mempoolTxs.length, merkleRoot, autoAcknowledge, speedMultiplier, goalCelebrated]
  );

  // Initialize workers
  const startWorkers = useCallback(() => {
    workersRef.current.forEach((w) => w.terminate());
    workersRef.current = [];

    const diffConfig = DIFFICULTY_PRESETS[difficultyLevel];
    const newWorkers: Worker[] = [];

    for (let i = 0; i < threads; i++) {
      const worker = new Worker('/mining-worker.js');
      worker.onmessage = handleWorkerMessage;

      const nonceStart = Math.floor(i * (0xffffffff / threads));
      const nonceStep = 1;

      worker.postMessage({
        command: 'start',
        threadId: i,
        version: blockHeader.version,
        prevBlockHashHex: blockHeader.prevBlockHash,
        merkleRootHex: merkleRoot,
        timestamp: Math.floor(Date.now() / 1000),
        bitsHex: diffConfig.targetBits,
        targetLeadingZeros: diffConfig.leadingHexZeros,
        targetHex: diffConfig.targetHex,
        nonceStart,
        nonceStep,
      });

      newWorkers.push(worker);
    }

    workersRef.current = newWorkers;
    sound.startFanHum();
  }, [threads, difficultyLevel, blockHeader.version, blockHeader.prevBlockHash, merkleRoot, handleWorkerMessage]);

  const stopWorkers = useCallback(() => {
    workersRef.current.forEach((w) => {
      w.postMessage({ command: 'stop' });
      w.terminate();
    });
    workersRef.current = [];
    setHashrate(0);
    sound.stopFanHum();
  }, []);

  // Mining Toggle
  const handleToggleMining = useCallback(() => {
    if (isMining) {
      stopWorkers();
      setIsMining(false);
    } else {
      startWorkers();
      setIsMining(true);
    }
  }, [isMining, startWorkers, stopWorkers]);

  // Restart workers on thread or difficulty change if mining is active
  useEffect(() => {
    if (isMining) {
      startWorkers();
    }
  }, [threads, difficultyLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      workersRef.current.forEach((w) => w.terminate());
      sound.stopFanHum();
    };
  }, []);

  // Reset Stats
  const handleResetStats = () => {
    setTotalHashes(0);
    setEarnedSatoshis(0);
    setEarnedBtc(0);
    setShares([]);
    setBlocks([]);
    setPayouts([]);
    setPeakHashrate(0);
    setRecentSamples([]);
    setGoalCelebrated(false);
  };

  // Change Target Payout Address
  const handleUpdateAddress = (newAddr: string) => {
    setBtcAddress(newAddr);
    localStorage.setItem('satoshiforge_btc_address', newAddr);
  };

  // Toggle Auto-Acknowledge
  const handleToggleAutoAcknowledge = () => {
    const next = !autoAcknowledge;
    setAutoAcknowledge(next);
    localStorage.setItem('satoshiforge_auto_ack', String(next));
  };

  // Trigger AI Hash Recalculation
  const triggerAIRecalculate = useCallback(async () => {
    setAiState((prev) => ({ ...prev, isCalculating: true }));
    try {
      const res = await fetch('/api/ai/optimize-hashes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashrate,
          totalHashes,
          validShares: shares.length,
          blocksFound: blocks.length,
          targetDifficulty: DIFFICULTY_PRESETS[difficultyLevel].name,
          btcAddress,
          recentHashes: recentSamples.slice(0, 5).map((s) => s.hash),
          currentExtranonce,
        }),
      });

      const data = await res.json();

      setAiState((prev) => ({
        ...prev,
        status: data.status || 'CONTINUOUS_AUTONOMOUS',
        assessment: data.assessment || prev.assessment,
        recommendedExtranonce: data.recommendedExtranonce || prev.recommendedExtranonce,
        entropyScore: data.entropyScore || prev.entropyScore,
        difficultyPrediction: data.difficultyPrediction || prev.difficultyPrediction,
        aiDirectives: data.aiDirectives || prev.aiDirectives,
        mathInsight: data.mathInsight || prev.mathInsight,
        lastCalculated: Date.now(),
        isCalculating: false,
      }));

      if (data.recommendedExtranonce) {
        setCurrentExtranonce(data.recommendedExtranonce);
      }
    } catch (err) {
      console.error('AI optimization error:', err);
      const fallbackExtra = '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0').toUpperCase();
      setCurrentExtranonce(fallbackExtra);
      setAiState((prev) => ({
        ...prev,
        recommendedExtranonce: fallbackExtra,
        lastCalculated: Date.now(),
        isCalculating: false,
      }));
    }
  }, [hashrate, totalHashes, shares.length, blocks.length, difficultyLevel, btcAddress, recentSamples, currentExtranonce]);

  // Periodic AI Continuous Hash Calculation
  useEffect(() => {
    if (!aiState.isAutoOptimizing) return;
    const interval = setInterval(() => {
      triggerAIRecalculate();
    }, 28000);

    return () => clearInterval(interval);
  }, [aiState.isAutoOptimizing, triggerAIRecalculate]);

  const miningStats: MiningStats = {
    hashrate,
    peakHashrate,
    totalHashes,
    validShares: shares.length,
    rejectedShares: 0,
    blocksFound: blocks.length,
    earnedSatoshis,
    earnedBtc,
    payoutAddress: btcAddress,
    activeThreads: threads,
    difficultyLevel,
    autoAcknowledge,
    targetGoalBtc: TARGET_GOAL_BTC,
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        isMining={isMining}
        networkStats={networkStats}
        onOpenChat={() => {
          sound.playClick();
          setIsChatOpen(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = sound.toggle();
          setSoundEnabled(next);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1,000 BTC Goal & Autonomous Operations Banner */}
        <TargetProgressBanner
          earnedBtc={earnedBtc}
          earnedSatoshis={earnedSatoshis}
          targetBtc={TARGET_GOAL_BTC}
          blocksFound={blocks.length}
          btcAddress={btcAddress}
          btcPriceUsd={networkStats?.btcPriceUsd || 96450}
          autoAcknowledge={autoAcknowledge}
          onToggleAutoAcknowledge={handleToggleAutoAcknowledge}
          speedMultiplier={speedMultiplier}
          onChangeSpeedMultiplier={setSpeedMultiplier}
          isMining={isMining}
          onStartMining={handleToggleMining}
        />

        {/* Destination Wallet Card */}
        <WalletCard
          btcAddress={btcAddress}
          earnedSatoshis={earnedSatoshis}
          earnedBtc={earnedBtc}
          btcPriceUsd={networkStats?.btcPriceUsd || 96450}
          validShares={shares.length}
          blocksFound={blocks.length}
          onUpdateAddress={handleUpdateAddress}
        />

        {/* Mining Controls & Hardware Allocation */}
        <MiningControls
          isMining={isMining}
          onToggleMining={handleToggleMining}
          onResetStats={handleResetStats}
          threads={threads}
          onThreadsChange={setThreads}
          currentDifficulty={difficultyLevel}
          onDifficultyChange={setDifficultyLevel}
        />

        {/* Live Double-SHA256 Hash Stream & Telemetry */}
        <HashStream
          isMining={isMining}
          hashrate={hashrate}
          peakHashrate={peakHashrate}
          totalHashes={totalHashes}
          currentNonce={currentNonce}
          recentSamples={recentSamples}
          activeThreads={threads}
          targetLeadingZeros={DIFFICULTY_PRESETS[difficultyLevel].leadingHexZeros}
        />

        {/* AI Autonomous Hash Engine & Copilot Director */}
        <AIOptimizerPanel
          aiState={aiState}
          onTriggerRecalculate={triggerAIRecalculate}
          onToggleAutoOptimize={() =>
            setAiState((prev) => ({ ...prev, isAutoOptimizing: !prev.isAutoOptimizing }))
          }
          btcAddress={btcAddress}
        />

        {/* Candidate Block & Coinbase Inspector */}
        <BlockInspector
          blockHeader={blockHeader}
          payoutAddress={btcAddress}
          blockRewardBtc={networkStats?.blockRewardBtc || 3.125}
          mempoolTxs={mempoolTxs}
          blockHeight={blockHeight}
        />

        {/* Valid Shares, Solved Blocks & Payout Ledger */}
        <SharesHistory
          shares={shares}
          blocks={blocks}
          payouts={payouts}
          payoutAddress={btcAddress}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-500 font-bold">₿ SatoshiForge AI</span>
            <span>-</span>
            <span>Continuous mining to 1,000 BTC targeting {btcAddress.slice(0, 10)}...</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Auto-Acknowledge Engaged</span>
            <span>•</span>
            <span>Target: 1,000.00 BTC</span>
            <span>•</span>
            <span>Gemini 3.8 Flash Neural Director</span>
          </div>
        </div>
      </footer>

      {/* AI Chat Copilot Drawer */}
      <AIChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        stats={miningStats}
        btcAddress={btcAddress}
      />

      {/* Manual Solved Block Modal (active only if auto-acknowledge is disabled) */}
      <BlockSolvedModal
        block={solvedBlockModal}
        onClose={() => setSolvedBlockModal(null)}
      />

      {/* Non-intrusive Auto-Ack Toast Notification */}
      <AutoAckToast
        block={autoAckToastBlock}
        onDismiss={() => setAutoAckToastBlock(null)}
      />

      {/* 1,000 BTC Goal Reached Milestone Celebration */}
      <GoalReachedModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onRestart={() => {
          handleResetStats();
          setIsGoalModalOpen(false);
        }}
        earnedBtc={earnedBtc}
        btcAddress={btcAddress}
        btcPriceUsd={networkStats?.btcPriceUsd || 96450}
        totalHashes={totalHashes}
        blocksFound={blocks.length}
      />
    </div>
  );
}
