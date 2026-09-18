#!/usr/bin/env node
/**
 * GUARDRAIL: every publishable workspace package's current version must exist on npm.
 *
 * Run this after `changeset publish`. It is the check that closes the hole in
 * ADR 0014: on 18 September 2026 a Release run concluded `success`, printed
 * "Successfully published" listing all four packages, and created git tags and
 * GitHub releases for all four — while `@opencosmos/ui@1.10.4` was never
 * published. Nothing in CI noticed, because the workflow's own success message
 * was the only thing being trusted.
 *
 * The invariant is simple and holds after every release run, publishing or not:
 *
 *   - if the run published, main's versions are the ones just pushed
 *   - if the run only opened a Version Packages PR, main's versions are
 *     unchanged and were published by an earlier run
 *
 * Either way, a version in a package.json that npm does not have means a release
 * was lost. Checks the registry directly — never the workflow's conclusion.
 *
 * Usage: node scripts/verify-published.mjs [--json]
 * Exits 1 if any version is missing.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = process.env.npm_config_registry?.replace(/\/$/, '') || 'https://registry.npmjs.org';

// npm's CDN can lag a little behind a publish, so a miss is retried before it is
// believed. Today's real failure was still absent after minutes, so this only
// smooths propagation — it cannot mask a genuinely lost release.
const ATTEMPTS = 5;
const BACKOFF_MS = [0, 2000, 5000, 10000, 20000];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function publishablePackages() {
  const out = [];
  for (const group of ['packages', 'apps']) {
    const dir = join(ROOT, group);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      const manifest = join(dir, entry, 'package.json');
      if (!existsSync(manifest)) continue;
      const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
      if (pkg.private === true || !pkg.name || !pkg.version) continue;
      out.push({ name: pkg.name, version: pkg.version });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function isPublished(name, version) {
  // The version-specific endpoint, not the packument: it is far less cached and
  // answers exactly the question being asked.
  const url = `${REGISTRY}/${name.replace('/', '%2f')}/${version}`;
  for (let i = 0; i < ATTEMPTS; i++) {
    if (BACKOFF_MS[i]) await sleep(BACKOFF_MS[i]);
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (res.status === 200) return { ok: true, attempts: i + 1 };
      if (res.status !== 404) {
        // 5xx or a rate limit is not evidence of absence — keep trying.
        continue;
      }
      if (i === ATTEMPTS - 1) return { ok: false, status: 404, attempts: i + 1 };
    } catch (err) {
      if (i === ATTEMPTS - 1) return { ok: false, error: String(err), attempts: i + 1 };
    }
  }
  return { ok: false, attempts: ATTEMPTS };
}

const asJson = process.argv.includes('--json');
const pkgs = publishablePackages();

if (pkgs.length === 0) {
  console.error('verify-published: found no publishable packages — refusing to report success.');
  process.exit(1);
}

const results = [];
for (const p of pkgs) {
  const r = await isPublished(p.name, p.version);
  results.push({ ...p, ...r });
}

const missing = results.filter((r) => !r.ok);

if (asJson) {
  console.log(JSON.stringify({ registry: REGISTRY, results }, null, 2));
} else {
  console.log(`Verifying ${pkgs.length} package(s) against ${REGISTRY}\n`);
  for (const r of results) {
    const mark = r.ok ? '✓' : '✗';
    const note = r.ok
      ? r.attempts > 1
        ? `(after ${r.attempts} attempts)`
        : ''
      : 'NOT ON THE REGISTRY';
    console.log(`  ${mark} ${r.name.padEnd(30)} ${r.version.padEnd(10)} ${note}`);
  }
  console.log('');
}

if (missing.length > 0) {
  console.error(
    `verify-published: ${missing.length} version(s) exist in this repository but not on npm:\n` +
      missing.map((m) => `  - ${m.name}@${m.version}`).join('\n') +
      '\n\nA release was lost. The workflow may have reported success anyway — see ADR 0014.\n' +
      'Re-run the Release workflow (Actions -> Release -> Run workflow); `changeset publish`\n' +
      'skips what is already published and retries only what is missing.'
  );
  process.exit(1);
}

console.log(`verify-published: all ${results.length} version(s) present on the registry.`);
