# 0009 — `@opencosmos/mcp`: the component library is addressable by agents, not just by people

**Date:** 2026-02-16 · **Status:** Accepted · **Relates to** [0002](0002-design-system-and-consumers-in-separate-repositories.md)

_An agent building against this library cannot read its source, so the library publishes a queryable description of itself — and that description is a surface that must be updated when a component is added._

## Context

Most code written against `@opencosmos/ui` is now written by agents, in a different repository ([0002](0002-design-system-and-consumers-in-separate-repositories.md)), where the library exists only as a `node_modules` directory of bundled output. An agent in that position has three options: grep minified `dist/`, hallucinate the API, or be told.

Hallucination is the realistic default and it is expensive in a specific way. The agent produces plausible code with props that do not exist, imports from paths that are not exported, and components that were never built. It compiles or it does not, but either way the work is wrong in ways that look right.

The design system's answer has to be that the library describes itself, in a form an agent can query, published alongside the code it describes.

## Decision

`@opencosmos/mcp` is a Model Context Protocol server published from this repository, exposing eight tools over the component library: `list_components`, `search_components`, `get_component`, `install_component`, `get_app_shell`, `get_examples`, `get_audit_checklist`, and `eject_component`.

Its `src/registry.ts` is the machine-readable description of every component — category, description, keywords, use cases, dependencies, the Radix primitive underneath, the full props table, sub-components, and a working example. `apps/web`'s `/docs/api.json` is generated from it.

The registry is one of several deliberately redundant agent-facing surfaces, each serving a different retrieval path: MCP for tool-using clients, `llms.txt` and `llms-full.txt` for context-window ingestion, `/docs/api.json` for HTTP fetch, and the `create` skill for Claude Code sessions in a consuming repository.

## Consequences

- **Adding a component is not finished when the component works.** The MCP registry, the llms files, the search index, the route config, and the Studio registry all have to be updated, or the component is invisible to whichever surface was skipped. This is why the workflow in [.claude/CLAUDE.md](../../.claude/CLAUDE.md) enumerates every surface: skipping one was the root cause of every audit finding in the SB-1 through SB-6 series.
- The registry duplicates facts that exist in the component source, and duplicated facts drift. Nothing currently checks the registry against the actual props. A wrong entry is worse than a missing one, because an agent will trust it.
- Component counts are stated in thirteen places across code, docs, and metadata, all of which go stale together. The grep check in the component workflow exists because of this and is not optional.
- `eject_component` gives agents the same escape hatch people have — the transformed source of a component, ready to paste — so an agent that needs to modify a component is not forced to reimplement it.
- The server still identifies itself internally as `sds-mcp-server`, from before the rename.

## Alternatives considered

- **Rely on TypeScript types alone.** Rejected: types give an agent shapes but not intent, use cases, or an idiomatic example, and reading them means resolving `.d.ts` files across ten subpath exports.
- **Documentation site only.** Rejected: it requires the agent to have web access and to know which URL to fetch. MCP puts the same data behind a tool call the client already knows how to make.
- **Generate the registry from the component source.** Not rejected — it is the obvious improvement and would remove the drift this record names as a cost. It has not been built. Until it is, the registry is hand-maintained and its accuracy is a discipline rather than a guarantee.
