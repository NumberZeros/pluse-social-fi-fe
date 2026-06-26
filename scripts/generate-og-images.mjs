#!/usr/bin/env node
/**
 * Generates static OG image PNGs (1200x630) for Pulse Social.
 * Run: node scripts/generate-og-images.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const IMAGES = [
  { name: 'og-image.png', label: 'Pulse Social', sub: 'Supporter Shares on Solana', color: [171, 254, 44] },
  { name: 'og-image-feed.png', label: 'Feed', sub: 'Posts from creators you follow', color: [171, 254, 44] },
  { name: 'og-image-explore.png', label: 'Explore', sub: 'Discover creators on Pulse', color: [20, 197, 142] },
  { name: 'og-image-what.png', label: 'What is Pulse?', sub: 'Supporter Shares explained', color: [171, 254, 44] },
  { name: 'og-image-why.png', label: 'Why Pulse?', sub: 'Creator-owned economics', color: [20, 197, 142] },
  { name: 'og-image-guide.png', label: 'User Guide', sub: 'Get started on Pulse Social', color: [171, 254, 44] },
  { name: 'og-image-profile.png', label: 'Creator Profile', sub: 'Support with Supporter Shares', color: [171, 254, 44] },
];

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, r, g, b) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const i = y * (width * 3 + 1) + 1 + x * 3;
      const t = y / height;
      raw[i] = Math.floor(r * (1 - t * 0.7));
      raw[i + 1] = Math.floor(g * (1 - t * 0.7));
      raw[i + 2] = Math.floor(b * (1 - t * 0.5));
    }
  }
  const compressed = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(publicDir, { recursive: true });

for (const img of IMAGES) {
  const png = createPng(1200, 630, ...img.color);
  writeFileSync(join(publicDir, img.name), png);
  console.log(`Created ${img.name}`);
}

console.log('Done — OG images generated in public/');
