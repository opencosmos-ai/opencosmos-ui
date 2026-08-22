# 0006 — Releases run through Changesets in CI; never version locally

**Date:** 2026-02-16 · **Status:** Accepted · **Relates to** [0002](0002-design-system-and-consumers-in-separate-repositories.md)

_A changeset per change, a bot-opened Version Packages PR, and a publish from CI on merge — because a local `version-packages` writes versions and changelogs that main has not agreed to._

## Context

Four packages publish to npm from this repository, with real dependency edges between them: `@opencosmos/ui` depends on `@opencosmos/tokens`, `@opencosmos/mcp` reads the UI source and registry, and every consumer app installs from npm at a pinned range ([0002](0002-design-system-and-consumers-in-separate-repositories.md)). Getting a version bump wrong is not a local mistake — it is a wrong number on a package other people are installing, and npm versions cannot be reissued.

Doing it by hand means deciding the semver level, editing package versions, updating internal dependency ranges, writing changelog entries, tagging, and publishing — for every affected package, in dependency order, every time. It is exactly the kind of work that is fine ninety times and wrong on the ninety-first.

## Decision

[Changesets](https://github.com/changesets/changesets), driven by CI.

1. A change that affects a published package ships with a changeset: `pnpm changeset`. The markdown file it writes names the packages and the semver level, and its body is the text a consumer reads on npm — so it is written for that reader, not as a commit summary.
2. On merge to `main`, `.github/workflows/release.yml` runs `changesets/action`. If unreleased changesets exist, it opens or updates a **Version Packages** pull request that consumes them, bumps versions, and writes the changelogs.
3. Merging that PR triggers the same workflow, which runs `pnpm release` — build, then `changeset publish` — with npm provenance enabled via `NPM_CONFIG_PROVENANCE`.

**Never run `pnpm version-packages` locally.** It is wired as the workflow's `version` command and exists for CI to call. Running it by hand writes version bumps, consumes changesets, and rewrites changelogs in a working tree, producing a state that has to be either pushed as a hand-made release commit or unpicked.

Docs-only changes need no changeset. Nothing published is affected, and an empty release is noise on npm.

## Consequences

- The version number is a function of the changesets on `main`, not of anyone's judgement at release time. Internal dependency ranges are updated for free (`updateInternalDependencies: "patch"`).
- Every published version has a changelog entry, because the entry is the input rather than an afterthought.
- Publishing requires a working `NPM_TOKEN` in CI. This has bitten once: 1.9.0 was version-bumped and merged but never published, because the token had expired and npm returned a 404 that read like a missing package. The version existed in git and in the changelog and not on npm for two weeks, while a consumer's bug ([0003](0003-precompiled-styles-css-over-a-consumer-safelist.md)) waited on it. **A merged Version Packages PR is not evidence that a version is on npm.** Check the registry.
- The Version Packages PR is a queue. Several changesets can accumulate in one release, which is usually desirable and occasionally means a fix waits for an unrelated feature.
- `changeset` config sets `commit: false`, so changesets are committed with the change they describe rather than separately.

## Alternatives considered

- **Manual `npm version` + `npm publish`.** Rejected: four interdependent packages, no changelog discipline, and no provenance. The first mistake is unrecoverable.
- **Automated semantic-release from commit messages.** Rejected: it derives the release note from a commit message written for maintainers. The changeset body is written for the consumer reading npm, which is a different audience and usually a different text.
- **Publishing locally from a maintainer's machine.** Rejected: no provenance attestation, no guarantee the tree matches `main`, and it depends on whose laptop is at hand.
