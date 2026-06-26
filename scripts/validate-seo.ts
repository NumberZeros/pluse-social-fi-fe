/**
 * SEO validation script — checks static assets, meta tags in index.html,
 * and optionally hits local preview with bot user-agents.
 *
 * Run: pnpm validate:seo
 * With server: pnpm preview & sleep 2 && BASE_URL=http://localhost:4173 pnpm validate:seo
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';
const RUN_FETCH = process.env.RUN_FETCH === '1';

const REQUIRED_OG_IMAGES = [
  'og-image.png',
  'og-image-feed.png',
  'og-image-explore.png',
  'og-image-what.png',
  'og-image-why.png',
  'og-image-guide.png',
  'og-image-profile.png',
];

const STATIC_ROUTES = ['/', '/feed', '/explore', '/what', '/why', '/guide'];

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

console.log('\n=== SEO Validation ===\n');

console.log('Static assets:');
for (const img of REQUIRED_OG_IMAGES) {
  const path = join(root, 'public', img);
  if (existsSync(path)) pass(`${img} exists`);
  else fail(`${img} missing — run pnpm generate:og`);
}

const robotsPath = join(root, 'public', 'robots.txt');
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf-8');
  if (robots.includes('Sitemap:')) pass('robots.txt has Sitemap');
  else fail('robots.txt missing Sitemap directive');
  if (robots.includes('Disallow: /dashboard')) pass('robots.txt disallows /dashboard');
  else fail('robots.txt should disallow /dashboard');
} else {
  fail('public/robots.txt missing');
}

const indexHtml = readFileSync(join(root, 'index.html'), 'utf-8');
const requiredMeta = ['og:title', 'og:description', 'og:image', 'application/ld+json'];
for (const tag of requiredMeta) {
  if (indexHtml.includes(tag)) pass(`index.html contains ${tag}`);
  else fail(`index.html missing ${tag}`);
}

const seoLibFiles = [
  'src/lib/seo/constants.ts',
  'src/lib/seo/page-config.ts',
  'src/lib/seo/schema/index.ts',
  'src/components/JsonLd.tsx',
  'middleware.ts',
  'api/_lib/bot-html.ts',
];
console.log('\nSource files:');
for (const file of seoLibFiles) {
  if (existsSync(join(root, file))) pass(file);
  else fail(`${file} missing`);
}

async function checkRoute(path: string, botUa: string) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'User-Agent': botUa },
      redirect: 'follow',
    });
    const html = await res.text();
    const checks = [
      { name: 'og:title', ok: html.includes('og:title') },
      { name: 'og:description', ok: html.includes('og:description') },
      { name: 'og:image', ok: html.includes('og:image') },
      { name: 'JSON-LD', ok: html.includes('application/ld+json') },
      { name: 'canonical', ok: html.includes('canonical') },
    ];
    const allOk = checks.every((c) => c.ok);
    if (allOk) pass(`[bot] ${path} — full meta + JSON-LD`);
    else {
      const missing = checks.filter((c) => !c.ok).map((c) => c.name);
      fail(`[bot] ${path} — missing: ${missing.join(', ')}`);
    }
  } catch (e) {
    fail(`[bot] ${path} — fetch failed: ${e}`);
  }
}

if (RUN_FETCH) {
  console.log(`\nBot UA checks (${BASE_URL}):`);
  const botUa = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  for (const route of STATIC_ROUTES) {
    await checkRoute(route, botUa);
  }
} else {
  console.log('\nSkipping live fetch (set RUN_FETCH=1 with preview server running)');
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
