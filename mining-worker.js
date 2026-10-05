/**
 * SatoshiForge Bitcoin Mining Web Worker
 * Performs double SHA-256 (SHA-256d) calculations on Bitcoin 80-byte block headers.
 */

// SHA-256 constants
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(n, x) {
  return (x >>> n) | (x << (32 - n));
}

function sha256Transform(w, state) {
  for (let i = 16; i < 64; i++) {
    const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
    const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
    w[i] = ((w[i - 16] + s0) | 0) + ((w[i - 7] + s1) | 0) | 0;
  }

  let a = state[0], b = state[1], c = state[2], d = state[3];
  let e = state[4], f = state[5], g = state[6], h = state[7];

  for (let i = 0; i < 64; i++) {
    const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
    const ch = (e & f) ^ (~e & g);
    const temp1 = (((((h + S1) | 0) + ch) | 0) + ((K[i] + w[i]) | 0)) | 0;
    const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const temp2 = (S0 + maj) | 0;

    h = g;
    g = f;
    f = e;
    e = (d + temp1) | 0;
    d = c;
    c = b;
    b = a;
    a = (temp1 + temp2) | 0;
  }

  state[0] = (state[0] + a) | 0;
  state[1] = (state[1] + b) | 0;
  state[2] = (state[2] + c) | 0;
  state[3] = (state[3] + d) | 0;
  state[4] = (state[4] + e) | 0;
  state[5] = (state[5] + f) | 0;
  state[6] = (state[6] + g) | 0;
  state[7] = (state[7] + h) | 0;
}

// 80-byte header single sha256: 80 bytes padded is 128 bytes (2 blocks: 64 + 64)
const paddedHeader = new Uint8Array(128);
const headerView = new DataView(paddedHeader.buffer);
paddedHeader[80] = 0x80;
// bit length 80 * 8 = 640 = 0x280
headerView.setUint32(124, 640, false);

// 32-byte sha256 output single sha256: 32 bytes padded is 64 bytes (1 block)
const paddedHash1 = new Uint8Array(64);
const hash1View = new DataView(paddedHash1.buffer);
paddedHash1[32] = 0x80;
// bit length 32 * 8 = 256 = 0x100
hash1View.setUint32(60, 256, false);

const w = new Uint32Array(64);
const state1 = new Uint32Array(8);
const state2 = new Uint32Array(8);

function sha256dHeader80(header80) {
  paddedHeader.set(header80);

  // Round 1 - block 0 (bytes 0..63)
  state1.set([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);
  for (let i = 0; i < 16; i++) {
    w[i] = headerView.getUint32(i * 4, false);
  }
  sha256Transform(w, state1);

  // Round 1 - block 1 (bytes 64..127)
  for (let i = 0; i < 16; i++) {
    w[i] = headerView.getUint32(64 + i * 4, false);
  }
  sha256Transform(w, state1);

  // Put state1 (32 bytes) into paddedHash1
  for (let i = 0; i < 8; i++) {
    hash1View.setUint32(i * 4, state1[i], false);
  }

  // Round 2 - block 0 (64 bytes)
  state2.set([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);
  for (let i = 0; i < 16; i++) {
    w[i] = hash1View.getUint32(i * 4, false);
  }
  sha256Transform(w, state2);

  return state2;
}

function hexToBytes(hex) {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const len = cleanHex.length / 2;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function reverseBytes(bytes) {
  const rev = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    rev[i] = bytes[bytes.length - 1 - i];
  }
  return rev;
}

let isMining = false;
let currentNonce = 0;
let nonceStep = 1;
let threadId = 0;
let headerBuffer = new Uint8Array(80);
let headerDataView = new DataView(headerBuffer.buffer);
let targetLeadingHexZeros = 4;
let targetHex = '';

self.onmessage = function (e) {
  const msg = e.data;
  if (!msg) return;

  if (msg.command === 'start') {
    threadId = msg.threadId || 0;
    currentNonce = msg.nonceStart || 0;
    nonceStep = msg.nonceStep || 1;
    targetLeadingHexZeros = msg.targetLeadingZeros || 4;
    targetHex = msg.targetHex || '0000ffff00000000000000000000000000000000000000000000000000000000';

    // Build base 80-byte header
    // 0..3: version (uint32 LE)
    headerDataView.setUint32(0, msg.version || 0x20000000, true);

    // 4..35: prev block hash reversed
    const prevBytes = reverseBytes(hexToBytes(msg.prevBlockHashHex));
    headerBuffer.set(prevBytes.subarray(0, 32), 4);

    // 36..67: merkle root reversed
    const merkleBytes = reverseBytes(hexToBytes(msg.merkleRootHex));
    headerBuffer.set(merkleBytes.subarray(0, 32), 36);

    // 68..71: timestamp
    headerDataView.setUint32(68, msg.timestamp || Math.floor(Date.now() / 1000), true);

    // 72..75: bits
    const bitsNum = parseInt(msg.bitsHex || '1d00ffff', 16);
    headerDataView.setUint32(72, bitsNum, true);

    isMining = true;
    mineLoop();
  } else if (msg.command === 'stop') {
    isMining = false;
  } else if (msg.command === 'update_target') {
    targetLeadingHexZeros = msg.targetLeadingZeros || 4;
    targetHex = msg.targetHex || targetHex;
  } else if (msg.command === 'update_header') {
    if (msg.merkleRootHex) {
      const merkleBytes = reverseBytes(hexToBytes(msg.merkleRootHex));
      headerBuffer.set(merkleBytes.subarray(0, 32), 36);
    }
    if (msg.timestamp) {
      headerDataView.setUint32(68, msg.timestamp, true);
    }
  }
};

function mineLoop() {
  if (!isMining) return;

  const BATCH_SIZE = 1500;
  let hashesInBatch = 0;
  const startTime = performance.now();

  let sampleHash = '';
  let sampleZeros = 0;
  let sampleNonce = currentNonce;

  for (let i = 0; i < BATCH_SIZE; i++) {
    // Write nonce into header (offset 76..79 little endian)
    headerDataView.setUint32(76, currentNonce, true);

    const hashWords = sha256dHeader80(headerBuffer);

    // Bitcoin block hash visual hex is in reversed byte order!
    // state2 words are [word0, word1, word2, word3, word4, word5, word6, word7]
    // The highest byte in the reversed hash comes from word7, then word6, etc.
    const w7 = hashWords[7];
    const w6 = hashWords[6];

    // Quick check: if target requires 4 hex zeros, top 16 bits of reversed hash (w7 bytes reversed) must be 0
    // Byte-swap w7 to get big-endian visual order:
    const b0 = (w7 >>> 0) & 0xff;
    const b1 = (w7 >>> 8) & 0xff;
    const b2 = (w7 >>> 16) & 0xff;
    const b3 = (w7 >>> 24) & 0xff;

    // Check leading zeros count
    let zeros = 0;
    if (b0 === 0) {
      zeros += 2;
      if (b1 === 0) {
        zeros += 2;
        if (b2 === 0) {
          zeros += 2;
          if (b3 === 0) {
            zeros += 2;
            const b4 = (w6 >>> 0) & 0xff;
            if (b4 === 0) {
              zeros += 2;
              const b5 = (w6 >>> 8) & 0xff;
              if (b5 === 0) {
                zeros += 2;
              } else if (b5 < 0x10) {
                zeros += 1;
              }
            } else if (b4 < 0x10) {
              zeros += 1;
            }
          } else if (b3 < 0x10) {
            zeros += 1;
          }
        } else if (b2 < 0x10) {
          zeros += 1;
        }
      } else if (b1 < 0x10) {
        zeros += 1;
      }
    } else if (b0 < 0x10) {
      zeros += 1;
    }

    hashesInBatch++;

    // Grab a sample for UI rendering every ~100 hashes
    if (i % 120 === 0) {
      sampleNonce = currentNonce;
      sampleZeros = zeros;
      // Convert full 32 bytes to reversed hex string
      sampleHash = getReversedHashHex(hashWords);
    }

    // Did we find a valid share or block?
    if (zeros >= targetLeadingHexZeros) {
      const fullHashHex = getReversedHashHex(hashWords);
      const isBlock = zeros >= 8 || fullHashHex < targetHex;

      self.postMessage({
        type: 'share_found',
        threadId,
        nonce: currentNonce,
        hashHex: fullHashHex,
        leadingZeros: zeros,
        isBlock,
      });
    }

    currentNonce = (currentNonce + nonceStep) >>> 0;
  }

  const duration = performance.now() - startTime;

  self.postMessage({
    type: 'progress',
    threadId,
    hashesCount: hashesInBatch,
    durationMs: duration,
    currentNonce,
    sample: sampleHash
      ? {
          nonce: sampleNonce,
          hash: sampleHash,
          leadingZeros: sampleZeros,
        }
      : null,
  });

  // Yield to event loop briefly so messages can be processed
  setTimeout(mineLoop, 0);
}

function getReversedHashHex(words) {
  let hex = '';
  // Loop backwards through words 7 down to 0
  for (let i = 7; i >= 0; i--) {
    const w = words[i];
    const b0 = (w >>> 0) & 0xff;
    const b1 = (w >>> 8) & 0xff;
    const b2 = (w >>> 16) & 0xff;
    const b3 = (w >>> 24) & 0xff;
    hex += b0.toString(16).padStart(2, '0');
    hex += b1.toString(16).padStart(2, '0');
    hex += b2.toString(16).padStart(2, '0');
    hex += b3.toString(16).padStart(2, '0');
  }
  return hex;
}
