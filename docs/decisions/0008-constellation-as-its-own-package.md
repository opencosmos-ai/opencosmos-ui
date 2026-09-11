# 0008 — `@opencosmos/constellation` ships from here as its own package

**Date:** 2026-05-08 · **Status:** Accepted · **Relates to** [opencosmos ADR 0009](https://github.com/shalomormsby/opencosmos/blob/main/docs/decisions/0009-constellation-as-its-own-package.md)

_The knowledge-graph renderer is built and published in this repository but is not a `@opencosmos/ui` component, because a WebGL renderer on a beta engine does not belong in the package every app imports for buttons._

## Context

The consuming repository needed a GPU force-directed graph renderer for its knowledge constellation. That side's decision — build on `@cosmos.gl/graph` (MIT, OpenJS Foundation) rather than `@cosmograph/cosmograph` (CC BY-NC-4.0), and publish the wrapper as a reusable primitive rather than burying it in a product — is recorded in full at [opencosmos ADR 0009](https://github.com/shalomormsby/opencosmos/blob/main/docs/decisions/0009-constellation-as-its-own-package.md). That record names the gap it leaves: *"the boundary is recorded only on this side of it. The package ships from `opencosmos-ui`; this repo consumes it. Anyone working there sees the package but not the reasoning."*

This record closes that gap. It does not restate the licensing argument — read 0009 for that. It states why the package lives here and why it is not a component.

The default place for a React renderer in this monorepo is `packages/ui`. Three things argue against it:

- **Weight.** `@cosmos.gl/graph` is a WebGL engine. `@opencosmos/ui` is installed by every OpenCosmos app, most of which will never render a graph, and the package already carries enforced bundle-size limits.
- **Cadence.** The engine is at `3.0.0-beta.9`. A beta dependency churns, and its churn should not force a version of the component library every app tracks.
- **Audience.** The renderer is useful to someone who wants nothing else from this design system. Inside `@opencosmos/ui` it is unreachable without adopting the whole library.

It belongs in this repository nonetheless. This is where packages are built, tested, and published ([0002](0002-design-system-and-consumers-in-separate-repositories.md)); it has the release pipeline ([0006](0006-changesets-driven-release-through-ci.md)) and a documentation site to demo it in.

## Decision

`packages/constellation` builds and publishes `@opencosmos/constellation` from this repository, as a peer of `@opencosmos/ui` rather than a component inside it.

It depends on `@cosmos.gl/graph` and peers only on React. It does not depend on `@opencosmos/ui` or `@opencosmos/tokens` — a consumer styles it through props and its own tokens. The graph payload is generated and served by the consumer; this package renders whatever it is handed.

## Consequences

- `@opencosmos/ui` acquires no WebGL dependency and stays within its size limits.
- The constellation versions on its own cadence, absorbing engine churn without touching the component library. It is at 0.2.x while `@opencosmos/ui` is at 1.10.x.
- A separate package to release, document, and register. It has its own entry in the Studio demo and its own changesets.
- The licensing argument that motivated all of this lives in the other repository. Anyone here evaluating "why not just use Cosmograph" must read [opencosmos ADR 0009](https://github.com/shalomormsby/opencosmos/blob/main/docs/decisions/0009-constellation-as-its-own-package.md) — the answer is that it is CC BY-NC-4.0 and would foreclose commercial use of anything that depends on it. **Do not swap the engine without reading that record.**
- The legacy `KnowledgeGraph` components still exported from `@opencosmos/ui` (at the `/knowledge-graph` subpath) are dormant predecessors, not current. They hardcode URLs that no longer resolve — inert while unused, a landmine if adopted.

## Alternatives considered

- **A component inside `@opencosmos/ui`.** Rejected: wrong granularity. A heavy, independently-versioned WebGL renderer does not belong in the package every app imports for buttons.
- **A package in the consuming repository.** Rejected: it would not be publishable as a reusable primitive, and it would sit outside this repository's release and documentation pipeline.
- **Depending on `@opencosmos/ui` for styling.** Rejected: it would reintroduce the coupling the split exists to avoid, and make the design system a prerequisite for using the renderer.
