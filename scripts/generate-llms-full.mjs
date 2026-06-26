#!/usr/bin/env node
/**
 * Concatenates llms.txt and companion .md files into public/llms-full.txt.
 * Run: node scripts/generate-llms-full.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const SECTIONS = [
  { title: 'Index', file: 'llms.txt' },
  { title: 'What', file: 'what.md' },
  { title: 'Why', file: 'why.md' },
  { title: 'Guide', file: 'guide.md' },
  { title: 'Whitepaper', file: 'whitepaper.md' },
];

const parts = [];

for (const { title, file } of SECTIONS) {
  const filePath = join(publicDir, file);
  if (!existsSync(filePath)) {
    console.error(`Missing required file: public/${file}`);
    process.exit(1);
  }
  const content = readFileSync(filePath, 'utf-8').trimEnd();
  parts.push(`# ${title}\n\n${content}`);
}

const output = parts.join('\n\n---\n\n') + '\n';
const outPath = join(publicDir, 'llms-full.txt');
writeFileSync(outPath, output);

const bytes = Buffer.byteLength(output, 'utf-8');
console.log(`Created public/llms-full.txt (${SECTIONS.length} sections, ${bytes} bytes)`);
