# 0002 — The design system and its consumers live in separate repositories

**Date:** 2026-02-16 · **Status:** Accepted · **Relates to** [0006](0006-changesets-driven-release-through-ci.md)

_The packages ship from here and are installed from npm there, so the design system's release cadence is decoupled from any product's — at the cost of never seeing a consumer break until it is published._

## Context

`@opencosmos/ui`, `@opencosmos/tokens`, `@opencosmos/mcp`, and `@opencosmos/constellation` are built, tested, documented, and published here. The applications that use them — portfolio, creative-powerup, stocks, cosmos — live in the [opencosmos](https://github.com/opencosmos-ai/opencosmos) repository and install the packages from npm at a pinned semver range, not through a workspace link.

The obvious alternative was one monorepo containing both. It has real advantages: a change to a component and the app that consumes it land in one commit, one CI run proves both still work, and there is no version to bump.

It also has one disadvantage that outweighs them here. A design system in the same repository as its consumers stops being a product with an API and becomes an implementation detail of whichever app is loudest. The pressure to add a one-off prop for one screen, or to reach into a component's internals from an app, is constant and hard to refuse when both sides are a single `git commit` away. The whole value of the system — build once, ripple everywhere — depends on there being a real boundary that a change has to cross deliberately.

The published artifact is also the thing under test. An app consuming `workspace:*` exercises the source, not the tarball: it never proves the `exports` map is right, that `dist/styles.css` was regenerated, or that a peer dependency is actually declared. Several real bugs found in consumers ( a missing `@opencosmos/tokens` dependency, `peerDependenciesMeta` marking five required packages optional) were invisible from inside this repository precisely because nothing here consumes the package the way npm does.

## Decision

Two repositories. This one builds and publishes the packages; [opencosmos](https://github.com/opencosmos-ai/opencosmos) consumes them from npm.

`apps/web` — OpenCosmos Studio — is the exception that makes this workable. It lives here and uses `workspace:*` references, so components can be developed and reviewed against a live application without a publish cycle. It is a documentation site, not a product: it has no business logic to bend the components toward.

The boundary is one-directional. Packages here know nothing about consumers. A consumer needing something the system does not have raises it here rather than styling around it locally — the rule stated in the `create` skill, which ships in the npm package and is copied into consuming repositories.

## Consequences

- A change reaching a product costs a version bump, a publish, and a dependency bump on the other side. That friction is the point: it makes "add it to the design system" and "patch it in the app" visibly different decisions.
- Products upgrade on their own schedule. A breaking change in `@opencosmos/ui` does not stop anyone shipping.
- **Consumers break after publish, not before.** There is no CI here that builds a real consumer against a candidate build. Every integration bug found so far — the safelist gap in [0003](0003-precompiled-styles-css-over-a-consumer-safelist.md), the missing runtime dependency, the fonts that `ThemeProvider` sets but nothing applies — was found by a human running an app, after the version was already on npm. This is the standing cost of the split and it has not been mitigated.
- Documentation is load-bearing rather than optional. A consumer's only view of this system is `README.md`, `llms.txt`, the MCP registry ([0009](0009-mcp-makes-the-library-addressable-by-agents.md)), and the `create` skill. When those are wrong, they are wrong in someone else's repository, which is why several package versions exist solely to correct them.
- The `create` skill exists in more than one place. `packages/ui/.claude/skills/create/SKILL.md` is canonical and ships in the npm package; consuming repositories carry a copy for skill discovery. Editing one means propagating to the others.

## Alternatives considered

- **One monorepo with everything.** Rejected: it dissolves the API boundary the design system depends on, and it lets apps consume source rather than the published artifact, so the artifact is never actually tested.
- **Consumers on `workspace:*` via a linked checkout.** Rejected for the same artifact-testing reason, plus it makes every product's build depend on a local clone of this repository being present and current.
- **Publishing from the consumer repository.** Rejected: it inverts the dependency and makes the design system's release cadence a function of whichever product last shipped.
