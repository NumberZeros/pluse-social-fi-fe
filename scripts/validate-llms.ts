/**
 * Validates llms.txt / llms-full.txt compliance with llmstxt.org spec.
 * Run: pnpm validate:llms
 * Live fetch: RUN_FETCH=1 BASE_URL=https://pulsesol.xyz pnpm validate:llms
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const BASE_URL = process.env.BASE_URL || 'https://pulsesol.xyz';
const RUN_FETCH = process.env.RUN_FETCH === '1';

const MAX_LLMS_SIZE = 20 * 1024;

const COMPANION_FILES = ['what.md', 'why.md', 'guide.md'];

let passed = 0;
let failed = 0;

function pass(msg: string) {
  console.log(`  ✓ ${msg}`);
  passed++;
}

function fail(msg: string) {
  console.error(`  ✗ ${msg}`);
  failed++;
}

function readPublic(name: string): string {
  return readFileSync(join(root, 'public', name), 'utf-8');
}

function validateLlmsTxt(content: string, label: string) {
  const lines = content.split('\n');
  const firstNonEmpty = lines.find((l) => l.trim().length > 0);
  if (firstNonEmpty?.startsWith('# ')) {
    pass(`${label}: H1 is first non-empty line`);
  } else {
    fail(`${label}: first non-empty line must be H1 (# Title)`);
  }

  const h1Index = lines.findIndex((l) => l.trim().length > 0);
  const afterH1 = lines.slice(h1Index + 1).find((l) => l.trim().length > 0);
  if (afterH1?.startsWith('>')) {
    pass(`${label}: blockquote after H1`);
  } else {
    fail(`${label}: blockquote (> ...) expected after H1`);
  }

  if (/<div|<script/i.test(content)) {
    fail(`${label}: contains HTML tags`);
  } else {
    pass(`${label}: no HTML tags`);
  }

  const listLinks = content.match(/- \[([^\]]+)\]\(([^)]+)\)/g) ?? [];
  const relativeLinks = listLinks.filter((l) => !l.includes('](http'));
  if (relativeLinks.length > 0) {
    fail(`${label}: ${relativeLinks.length} list link(s) are not absolute URLs`);
  } else if (listLinks.length > 0) {
    pass(`${label}: all ${listLinks.length} list links use absolute URLs`);
  }

  if (label === 'llms.txt') {
    const size = Buffer.byteLength(content, 'utf-8');
    if (size < MAX_LLMS_SIZE) {
      pass(`llms.txt size ${size} bytes (< ${MAX_LLMS_SIZE})`);
    } else {
      fail(`llms.txt size ${size} bytes exceeds ${MAX_LLMS_SIZE} byte limit`);
    }

    if (content.includes('## Optional')) {
      const optionalSection = content.split('## Optional')[1] ?? '';
      if (/- \[/.test(optionalSection)) {
        pass('llms.txt: ## Optional section has links');
      } else {
        fail('llms.txt: ## Optional section has no links');
      }
    } else {
      fail('llms.txt: missing ## Optional section');
    }

    const bodyBeforeH2 = content.split(/^## /m)[0] ?? '';
    if (/^##{2,3} /m.test(bodyBeforeH2.replace(/^# .+\n/m, '').replace(/^> .+\n/m, ''))) {
      fail('llms.txt: body section must not contain H2/H3');
    } else {
      pass('llms.txt: body section has no H2/H3');
    }
  }
}

console.log('\n=== LLMs.txt Validation ===\n');

console.log('Required files:');
for (const file of ['llms.txt', 'llms-full.txt', ...COMPANION_FILES]) {
  if (existsSync(join(root, 'public', file))) pass(`public/${file} exists`);
  else fail(`public/${file} missing`);
}

if (existsSync(join(root, 'public', 'llms.txt'))) {
  console.log('\nllms.txt structure:');
  validateLlmsTxt(readPublic('llms.txt'), 'llms.txt');
}

if (existsSync(join(root, 'public', 'llms-full.txt'))) {
  console.log('\nllms-full.txt structure:');
  const full = readPublic('llms-full.txt');
  if (full.includes('---')) pass('llms-full.txt: section separators present');
  else fail('llms-full.txt: missing --- section separators');
  if (full.includes('# What') && full.includes('# Whitepaper')) {
    pass('llms-full.txt: includes expected sections');
  } else {
    fail('llms-full.txt: missing expected section headers');
  }
}

async function checkLiveUrl(path: string) {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    const text = await res.text();
    const contentType = res.headers.get('content-type') ?? '';

    if (!res.ok) {
      fail(`[live] ${path} — HTTP ${res.status}`);
      return;
    }

    const isHtml = text.trimStart().startsWith('<!') || text.includes('<div id="root"');
    if (isHtml) {
      fail(`[live] ${path} — returned SPA HTML instead of Markdown/text`);
      return;
    }

    if (path.endsWith('.txt') && !text.startsWith('#')) {
      fail(`[live] ${path} — content does not start with H1`);
      return;
    }

    pass(`[live] ${path} — ${res.status}, ${contentType.split(';')[0]}, ${text.length} chars`);
  } catch (e) {
    fail(`[live] ${path} — fetch failed: ${e}`);
  }
}

if (RUN_FETCH) {
  console.log(`\nLive fetch (${BASE_URL}):`);
  await checkLiveUrl('/llms.txt');
  await checkLiveUrl('/llms-full.txt');
  await checkLiveUrl('/what.md');
} else {
  console.log('\nSkipping live fetch (set RUN_FETCH=1 to verify production URLs)');
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
