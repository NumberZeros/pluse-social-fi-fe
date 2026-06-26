/**
 * Generates public/guide.md from src/lib/seo/guide-data.ts (single source of truth).
 * Run: tsx scripts/generate-guide-md.ts
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FAQ_ITEMS, GUIDE_SECTIONS } from '../src/lib/seo/guide-data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'public', 'guide.md');

const lines: string[] = [
  '# Pulse Social User Guide',
  '',
  'Step-by-step onboarding for creators and fans on Pulse Social.',
  '',
];

for (const section of GUIDE_SECTIONS) {
  lines.push(`## ${section.title}`, '', section.description, '');
  section.steps.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });
  lines.push('');
}

lines.push('## Frequently Asked Questions', '');

for (const item of FAQ_ITEMS) {
  lines.push(`### ${item.q}`, '', item.a, '');
}

writeFileSync(outPath, lines.join('\n').trimEnd() + '\n');
console.log(`Created public/guide.md (${GUIDE_SECTIONS.length} sections, ${FAQ_ITEMS.length} FAQs)`);
