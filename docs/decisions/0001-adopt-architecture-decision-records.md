# 0001 — Adopt Architecture Decision Records

**Date:** 2026-08-22 · **Status:** Accepted · **Relates to** [opencosmos ADR 0001](https://github.com/shalomormsby/opencosmos)

_Records why load-bearing choices were made, so they survive the session that made them and are not undone by someone who cannot see the reason._

## Context

A codebase records what it does. It rarely records why, and almost never records what was rejected and on what grounds. In a design system that gap is unusually expensive, because the constraints here are not local. Every published package is installed by apps in another repository, built by people and agents who never see this code — only its output, and its rules.

**Relitigation.** Settled questions get reopened from scratch, usually under deadline pressure, usually with worse information than the first time. A single maintainer is the highest-risk case: there is no colleague who remembers.

**Agent context loss.** This repository is built with agents, continuously. An agent reading a constraint without its reasoning treats the constraint as arbitrary — and arbitrary constraints get helpfully optimized away.

This is not hypothetical here. `packages/ui/styles.src.css` builds `dist/styles.css` by importing `tailwindcss/utilities.css` rather than `tailwindcss`, and by pulling the design tokens in through `@reference` so they generate classes but emit no `:root` variables. Both look like someone taking a strange path to a simple import. Both are load-bearing: the plain import would ship Tailwind's preflight and its entire default `@theme` into every consuming app, overwriting the theme values those apps set. An agent "simplifying" that file to one `@import "tailwindcss"` would silently break the theming of every product downstream, while believing it had tidied up.

The story behind that file is the reason this directory exists. Consumer apps used to get their component styles from a hand-written 245-line Tailwind safelist — a workaround for Tailwind v4 + Turbopack not scanning pnpm-symlinked `node_modules`. Every new component and every version bump silently dropped classes from it. It surfaced as a malformed Reset modal: `AlertDialog` uses the base `max-w-lg`, the safelist carried only `sm:max-w-lg`, so the modal lost its width constraint and rendered edge-to-edge. The bug was in an app; the cause was a consumption model this repository had never made a decision about. `@opencosmos/ui` 1.9.0 fixed it by shipping the precompiled stylesheet ([0003](0003-precompiled-styles-css-over-a-consumer-safelist.md)), and the safelist was deleted. Nothing in either repository recorded why the new file is built the way it is — until now.

The value of a decision record is highest exactly where the reasoning is least visible from the code, which is also where the risk of a well-intentioned reversal is highest.

## Decision

Record each load-bearing decision as a small, numbered, immutable markdown file in `docs/decisions/`, using the Nygard format already running in the sibling [opencosmos](https://github.com/shalomormsby/opencosmos) and Agency of One repositories. Same conventions, deliberately, so all three read the same way and a decision that spans two of them can cross-reference rather than diverge.

### Conventions

- **Location:** `docs/decisions/NNNN-short-slug.md`, zero-padded, sequential.
- **Status:** `Proposed` · `Accepted` · `Superseded by NNNN`.
- **Append-only.** Never edit a record to change its meaning. To reverse a decision, write a new one that supersedes it and link both directions. The history of reversals is itself information.
- **Header:** `**Date:** YYYY-MM-DD · **Status:** …` plus any `Supersedes` / `Superseded by` / `Relates to` cross-links.
- **Summary line:** one italic sentence directly beneath the header, carrying the decision *and* its reason in roughly fifteen to thirty words. It orients a reader opening the file, and `pnpm adr:index` harvests it into the index table in [README.md](README.md).
- **No frontmatter.** The heading carries the number and title and the header line carries the status; restating either in frontmatter would create two sources of truth that drift apart. The index is generated from the documents, not from a parallel set of metadata.
- **No hard wrapping.** Let lines flow.

### What earns a record

A decision earns a record when it is **expensive to reverse**, **constrains future work**, or has **non-obvious rationale** — especially when the code alone would mislead a reader into thinking it was arbitrary. A useful test: *if someone changed this next month without knowing why it was chosen, would something break or regress?*

In this repository there is a sharper test available, because the blast radius is measurable. **If reversing it would break a consuming app rather than this one, it earns a record.** That covers the whole styling contract, the release mechanism, the package boundaries, and every invariant a consumer is expected to respect rather than work around.

Decisions that never produce a commit still belong here — a considered-and-declined design, a naming call, a boundary drawn between packages. These have no other home.

### What belongs elsewhere

| Where | Holds |
|---|---|
| `docs/decisions/` | why a load-bearing choice was made, and what was rejected |
| [CHANGELOG.md](../../CHANGELOG.md) and the package changelogs | why *this change, now, in this form* — shipped work, organized by version and date |
| [AGENTS.md](../../AGENTS.md) and [.claude/CLAUDE.md](../../.claude/CLAUDE.md) | how to build here — conventions, workflows, the registration checklist |
| `.changeset/` entries | what a release does, in the words a consumer will read on npm |

The changelogs are not demoted to lists of what changed. They carry real reasoning today and keep that job. The difference is scope and lifetime: a changelog entry explains a change, an ADR explains a constraint, and only the latter needs to still be findable in two years by someone who has no idea when it was decided. Where a record has a changelog entry behind it, it links to it rather than restating it.

### Structure

Four headings, in this order. Keep each short enough to read in a sitting.

- **Context** — the situation and the forces in tension. What made this a decision rather than an obvious step. Include the concrete detail that motivated it; specifics age better than principles. The malformed modal is worth more than "safelists are fragile."
- **Decision** — what was chosen, stated plainly and in the present tense.
- **Consequences** — what follows, including the costs accepted. A record with only upsides is not being honest. Where the decision is only partly applied, say so, and name the exceptions.
- **Alternatives considered** — what was rejected and why. Usually the most valuable section, because it is the part that prevents relitigation — and in this repository, the part that stops a consumer from reaching for the workaround the design system already ruled out.

## Consequences

- Small cost per decision; the payoff lands at every future *"why did we…?"*, and at every agent that would otherwise have optimized a constraint away.
- `docs/decisions/` becomes onboarding material — for collaborators, for agents, and for the maintainer who no longer remembers.
- `AGENTS.md` points here and states that writing a record does not require asking first. The cost of a mediocre record is low; the cost of a decision that was never written down is what this directory exists to fix.
- Superseded records stay in place rather than being deleted or edited.
- The index in `README.md` is generated by `scripts/adr-index.mjs` and verified in CI by `pnpm adr:index --check`. A hand-kept index is one forgotten edit from lying, and an index that lies is worse than none — readers stop trusting it, then stop using it.
- Decisions that span this repository and its consumer are now recorded on both sides. [0008](0008-constellation-as-its-own-package.md) is the first: `@opencosmos/constellation` ships from here and is consumed there, and until now the reasoning existed only on the consuming side.

## Alternatives considered

- **Leave the reasoning in CHANGELOG.md.** Rejected as the primary mechanism. The changelogs here are genuinely good — the entry for `@opencosmos/ui` 1.10.3 diagnoses the ghost-button bug rather than summarizing it. But they are organized by release, so finding a constraint means knowing roughly when it shipped, and a constraint that predates the entry that mentions it has nowhere to live at all.
- **Expand AGENTS.md.** Rejected: it is already 500 lines and answers *how do I build here*. Adding *why is it like this* to the same document makes both harder to find, and AGENTS.md is edited continuously — the opposite of the immutability a decision record needs.
- **Commit messages.** Rejected as the primary mechanism: not discoverable without knowing what to search for. They remain the best raw material for backfilling, and several of these records were written from them.
- **The "Hard-Won Lessons" section in `.claude/CLAUDE.md`.** Not rejected, but not sufficient. It captures three real traps well and is the direct ancestor of [0010](0010-context-hooks-return-a-safe-default.md) and [0011](0011-no-eager-jsx-in-registry-examples.md). What it cannot do is hold consequences, rejected alternatives, or supersession — and it covers debugging traps rather than the deliberate boundaries that make up most of this directory.
- **Nothing.** Rejected. The reasoning behind `styles.src.css` survives today only in a changeset body and a commit message, and the decision it encodes governs how every OpenCosmos app gets its CSS.
