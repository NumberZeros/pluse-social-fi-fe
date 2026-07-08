#!/usr/bin/env node
/**
 * Generates static OG image PNGs (1200x630) for Pulse Social.
 * Run: node scripts/generate-og-images.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

/** Brand palette as RGB (mirrors design-system tokens). */
const COLORS = {
  background: [6, 8, 10],
  surface: [11, 16, 21],
  border: [27, 38, 50],
  primary: [20, 241, 149],
  secondary: [153, 69, 255],
  muted: [184, 192, 204],
  foreground: [255, 255, 255],
};

const MARK = {
  squircle:
    'M18 0 H46 C55.941 0 64 8.059 64 18 V46 C64 55.941 55.941 64 46 64 H18 C8.059 64 0 55.941 0 46 V18 C0 8.059 8.059 0 18 0 Z',
  pTop:
    'M22 11 H35 C43.837 11 51 17.716 51 26 C51 34.284 43.837 41 35 41 H31 L22 45 Z ' +
    'M31 20 H35 C38.866 20 42 22.686 42 26 C42 29.314 38.866 32 35 32 H31 Z',
  pLeg: 'M22 49.5 L31 45.5 L31 52.5 L22 56.5 Z',
};

const IMAGES = [
  { name: 'og-image.png', label: 'Pulse Social', sub: 'Supporter Shares on Solana', accent: COLORS.primary },
  { name: 'og-image-feed.png', label: 'Feed', sub: 'Posts from creators you follow', accent: COLORS.primary },
  { name: 'og-image-explore.png', label: 'Explore', sub: 'Discover creators on Pulse', accent: COLORS.primary },
  { name: 'og-image-what.png', label: 'What is Pulse?', sub: 'Supporter Shares explained', accent: COLORS.primary },
  { name: 'og-image-why.png', label: 'Why Pulse?', sub: 'Creator-owned economics', accent: COLORS.secondary },
  { name: 'og-image-guide.png', label: 'User Guide', sub: 'Get started on Pulse Social', accent: COLORS.primary },
  { name: 'og-image-profile.png', label: 'Creator Profile', sub: 'Support with Supporter Shares', accent: COLORS.secondary },
];

function rgb([r, g, b], alpha) {
  return alpha != null ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOgSvg({ label, sub, accent }) {
  const [br, bg, bb] = COLORS.background;
  const [sr, sg, sb] = COLORS.surface;
  const [ar, ag, ab] = accent;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgb(${br},${bg},${bb})"/>
      <stop offset="100%" stop-color="rgb(${sr},${sg},${sb})"/>
    </linearGradient>
    <radialGradient id="glow" cx="15%" cy="15%" r="75%">
      <stop offset="0%" stop-color="rgb(${ar},${ag},${ab})" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="rgb(${ar},${ag},${ab})" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(60, 168) scale(1.125)">
    <path d="${MARK.squircle}" fill="${rgb(COLORS.surface)}"/>
    <path d="${MARK.squircle}" fill="none" stroke="${rgb(COLORS.border)}" stroke-width="1"/>
    <path d="${MARK.pTop}" fill="${rgb(COLORS.primary)}" fill-rule="evenodd"/>
    <path d="${MARK.pLeg}" fill="${rgb(COLORS.primary)}"/>
  </g>
  <text x="152" y="228" fill="${rgb(COLORS.foreground)}" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="700">Pulse Social</text>
  <text x="60" y="360" fill="${rgb(COLORS.foreground)}" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800">${escapeXml(label)}</text>
  <text x="60" y="430" fill="${rgb(COLORS.muted)}" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="400">${escapeXml(sub)}</text>
</svg>`;
}

mkdirSync(publicDir, { recursive: true });

for (const img of IMAGES) {
  const svg = buildOgSvg(img);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(publicDir, img.name), png);
  console.log(`Created ${img.name}`);
}

console.log('Done — OG images generated in public/');
