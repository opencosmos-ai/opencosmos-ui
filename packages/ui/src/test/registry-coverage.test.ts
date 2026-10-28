import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * GUARDRAIL: every component exported from @opencosmos/ui has an entry in the
 * MCP registry.
 *
 * ADR 0009 states the obligation plainly — the MCP description of this library
 * "is a surface that must be updated when a component is added". It was prose
 * only, enforced by nobody, and two components had already drifted out of it:
 * AppSidebar and OpenCosmosIcon were exported and installable, and invisible to
 * any agent querying MCP for what this library offers.
 *
 * That failure is silent in the worst way. Nothing breaks, no build goes red —
 * an agent simply never learns the component exists and writes bespoke JSX
 * instead, which is the exact outcome the library exists to prevent.
 *
 * This reads across to packages/mcp on purpose. The invariant is a relationship
 * *between* the two packages, so it cannot live inside either one alone, and a
 * guard that can only see half of what it is checking is not a guard.
 *
 * If this fails after you add a component: add its metadata to
 * packages/mcp/src/registry.ts. Do not add it to an exclusion list here.
 */

const UI_INDEX = resolve(__dirname, '..', 'index.ts');
const MCP_REGISTRY = resolve(__dirname, '..', '..', '..', 'mcp', 'src', 'registry.ts');

/**
 * Component modules re-exported from the barrel. Both quote styles appear in
 * index.ts and an earlier single-quote-only reading of this file wrongly
 * reported three components as unexported — hence `['"]` rather than `'`.
 */
function exportedComponentNames(): string[] {
  const src = readFileSync(UI_INDEX, 'utf8');
  const paths = [...src.matchAll(/export \* from ['"]\.\/components\/([^'"]+)['"]/g)].map(
    (m) => m[1]
  );
  // The last path segment is the component name: './components/layout/Footer'
  // resolves to layout/Footer/Footer.tsx, and blocks/social/OpenGraphCard nests
  // one deeper. Namespace re-exports (`export * as Layout from …`) are category
  // barrels rather than components and are deliberately not matched above.
  return [...new Set(paths.map((p) => p.split('/').pop() as string))].sort();
}

function mcpRegisteredNames(): string[] {
  const src = readFileSync(MCP_REGISTRY, 'utf8');
  return [...new Set([...src.matchAll(/^ {4}name: '([^']+)'/gm)].map((m) => m[1]))].sort();
}

describe('MCP registry covers the public component surface', () => {
  it('finds a non-empty component surface to check', () => {
    // A reader that silently matches nothing would make every assertion below
    // pass vacuously — the failure mode this repository keeps meeting.
    expect(exportedComponentNames().length).toBeGreaterThan(50);
    expect(mcpRegisteredNames().length).toBeGreaterThan(50);
  });

  it('has an MCP entry for every exported component', () => {
    const registered = new Set(mcpRegisteredNames());
    const missing = exportedComponentNames().filter((n) => !registered.has(n));

    expect(
      missing,
      missing.length
        ? `Exported from @opencosmos/ui but absent from the MCP registry:\n` +
            missing.map((m) => `  - ${m}`).join('\n') +
            `\n\nAdd metadata to packages/mcp/src/registry.ts. An agent cannot ` +
            `discover a component that is not described there (ADR 0009).`
        : undefined
    ).toEqual([]);
  });

  it('has no MCP entry for a component that is not exported', () => {
    const exported = new Set(exportedComponentNames());
    const orphaned = mcpRegisteredNames().filter((n) => !exported.has(n));

    expect(
      orphaned,
      orphaned.length
        ? `Described in the MCP registry but not exported from @opencosmos/ui:\n` +
            orphaned.map((m) => `  - ${m}`).join('\n') +
            `\n\nAn agent told to use these would write an import that fails. ` +
            `Either export the component or remove its registry entry.`
        : undefined
    ).toEqual([]);
  });
});
