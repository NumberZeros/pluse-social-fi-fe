#!/usr/bin/env tsx
/**
 * Validates that FE source files use design-system tokens instead of raw hex / legacy names.
 * Canonical hex values live only in src/design-system/tokens.css and the OG brand constants.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SCAN_ROOTS = ['src', 'api', 'scripts'].map((d) => join(ROOT, d));

/** Files allowed to contain raw hex (canonical brand sources). Relative to ROOT. */
const HEX_ALLOWED_FILES = new Set([
  'src/design-system/tokens.css',
  'api/_lib/og-brand.ts',
]);

/** Files skipped entirely (self-referential: this validator lists banned strings). */
const SKIPPED_FILES = new Set([
  'scripts/validate-design-tokens.ts',
]);

const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/g;

interface Rule {
  name: string;
  pattern: RegExp;
}

/** Hard failures — always error. */
const BANNED_PATTERNS: Rule[] = [
  { name: 'lens-lime', pattern: /lens-lime/i },
  { name: 'color-lens-*', pattern: /color-lens-/i },
  { name: 'color-primary-green', pattern: /color-primary-green/i },
  { name: 'color-social-cyan', pattern: /color-social-cyan/i },
  { name: 'color-solana-green', pattern: /solana-green/i },
  { name: 'color-solana-purple', pattern: /solana-purple/i },
  { name: 'Space Grotesk', pattern: /Space Grotesk/i },
  { name: 'arbitrary hex class', pattern: /(?:bg|text|border|from|to|via)-\[#/i },
  { name: 'old brand hex #ABFE2C', pattern: /#ABFE2C/i },
  { name: 'legacy glass-card', pattern: /glass-card/i },
  { name: 'old lens-lime RGB (171,254,44)', pattern: /171,\s*254,\s*44/ },
];

/**
 * Semantic conventions. Enforced as errors — every listed pattern has a
 * one-to-one semantic token replacement (see .cursor/rules/pulse-design-system.mdc).
 */
const SEMANTIC_PATTERNS: Rule[] = [
  { name: 'text-gray-* → text-muted/foreground', pattern: /\btext-gray-\d/ },
  { name: 'bg-gray-* → bg-surface*', pattern: /\bbg-gray-\d/ },
  { name: 'text-white → text-foreground', pattern: /\btext-white\b/ },
  { name: 'bg-black → bg-background', pattern: /\bbg-black\b/ },
  { name: 'border-white/* → border-border', pattern: /\bborder-white\// },
];

interface Violation {
  file: string;
  line: number;
  message: string;
}

function collectFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.vercel') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, acc);
    } else if (/\.(tsx?|css|mjs|js)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function checkFile(filePath: string): Violation[] {
  const rel = relative(ROOT, filePath);
  if (SKIPPED_FILES.has(rel)) return [];

  const hexAllowed = HEX_ALLOWED_FILES.has(rel);
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  lines.forEach((line, index) => {
    const lineNo = index + 1;

    if (!hexAllowed) {
      const hexMatches = line.match(HEX_PATTERN);
      if (hexMatches) {
        violations.push({
          file: rel,
          line: lineNo,
          message: `Raw hex literal found: ${hexMatches.join(', ')}`,
        });
      }
    }

    for (const rule of [...BANNED_PATTERNS, ...SEMANTIC_PATTERNS]) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: rel,
          line: lineNo,
          message: `Banned token/pattern "${rule.name}"`,
        });
      }
    }
  });

  return violations;
}

function main(): void {
  const files = SCAN_ROOTS.flatMap((root) => collectFiles(root));
  const violations = files.flatMap(checkFile);

  if (violations.length === 0) {
    console.log(`✓ Design token validation passed (${files.length} files checked)`);
    process.exit(0);
  }

  console.error(`✗ Design token validation failed (${violations.length} violation(s)):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — ${v.message}`);
  }
  process.exit(1);
}

main();
