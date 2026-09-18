# Decisions (ADRs)

**Why we chose what we chose.** Numbered, dated, append-only. Never edit a decision — supersede it with a new one and link back.

Format: `NNNN-short-slug.md` · Status: Proposed | Accepted | Superseded by NNNN · Structure: Context → Decision → Consequences → Alternatives considered

Write one when a decision is expensive to reverse, constrains future work, or has non-obvious rationale — especially when the code alone would read as arbitrary. Not every choice; only the load-bearing ones. This repository publishes packages that every OpenCosmos app installs, so a constraint recorded here is usually a constraint on somebody else's build. Reasoning about a specific change belongs in [CHANGELOG.md](../../CHANGELOG.md) or the package changelogs; the how-to-build-it rules belong in [AGENTS.md](../../AGENTS.md).

Start with [0001 — Adopt Architecture Decision Records](0001-adopt-architecture-decision-records.md), which covers the purpose, conventions, and structure in full.

Regenerate the table below with `pnpm adr:index`. CI runs `pnpm adr:index --check`.

## Index

<!-- adr-index:start -->

| # | Decision | Status | |
|---|---|---|---|
| [0001](0001-adopt-architecture-decision-records.md) | **Adopt Architecture Decision Records** | Accepted | Records why load-bearing choices were made, so they survive the session that made them and are not undone by someone who cannot see the reason. |
| [0002](0002-design-system-and-consumers-in-separate-repositories.md) | **The design system and its consumers live in separate repositories** | Accepted | The packages ship from here and are installed from npm there, so the design system's release cadence is decoupled from any product's — at the cost of never seeing a consumer break until it is published. |
| [0003](0003-precompiled-styles-css-over-a-consumer-safelist.md) | **Ship a precompiled `dist/styles.css` rather than asking consumers to scan or safelist** | Accepted | Consumers import one stylesheet and get every component class, because both alternatives — scanning `node_modules` and hand-keeping a safelist — fail silently and drop classes on every version bump. |
| [0004](0004-package-styles-ship-unlayered.md) | **Component styles ship unlayered; consumers override at the call site with `!`** | Accepted | `styles.css` emits unlayered utilities, which outrank an app's own layered Tailwind, so an override belongs on the element as `class!` — never on the app's global imports. |
| [0005](0005-tailwind-class-names-are-never-interpolated.md) | **Tailwind class names are never built by interpolation** | Accepted | `gap-${n}` appears literally nowhere, so Tailwind never emits the utility and the component renders unstyled with no error — the rule is enforced by a test, not by review. |
| [0006](0006-changesets-driven-release-through-ci.md) | **Releases run through Changesets in CI; never version locally** | Accepted | A changeset per change, a bot-opened Version Packages PR, and a publish from CI on merge — because a local `version-packages` writes versions and changelogs that main has not agreed to. |
| [0007](0007-tokens-as-a-separate-package.md) | **`@opencosmos/tokens` is a package of its own** | Accepted | The design language is published independently of the components that consume it, so a product can adopt the palette, type scale, and motion curves without importing React. |
| [0008](0008-constellation-as-its-own-package.md) | **`@opencosmos/constellation` ships from here as its own package** | Accepted | The knowledge-graph renderer is built and published in this repository but is not a `@opencosmos/ui` component, because a WebGL renderer on a beta engine does not belong in the package every app imports for buttons. |
| [0009](0009-mcp-makes-the-library-addressable-by-agents.md) | **`@opencosmos/mcp`: the component library is addressable by agents, not just by people** | Accepted | An agent building against this library cannot read its source, so the library publishes a queryable description of itself — and that description is a surface that must be updated when a component is added. |
| [0010](0010-context-hooks-return-a-safe-default.md) | **A context hook in this library returns a safe default; it never throws** | Accepted | Under `transpilePackages`, webpack can split a component from the module that called `createContext`, so `useContext` returns null with the Provider present — and the standard throw turns a cosmetic problem into a crash. |
| [0011](0011-no-eager-jsx-in-registry-examples.md) | **No eager JSX in the Studio registry's `examples[].children`** | Accepted | `component-registry.tsx` is a module-level object, so JSX in it calls `createElement` at import time — one undefined export takes down every docs page that imports the module, not just its own. |
| [0012](0012-motion-intensity-zero-is-a-first-class-mode.md) | **Motion intensity 0 is a first-class rendering mode, not a degradation** | Accepted | Every animating component must check `useMotionPreference()` and render correctly with no animation at all, because motion is a user setting here — not only an accessibility fallback. |
| [0013](0013-themeprovider-owns-the-dark-class.md) | **`ThemeProvider` owns the `dark` class; never hardcode it on an element** | Accepted | Dark-mode token values live under a bare `.dark` selector, so any element carrying that class re-pins every token for its whole subtree and makes the theme customizer look broken. |
| [0014](0014-publish-through-trusted-publishing-not-a-token.md) | **Publish through npm trusted publishing, not a token** | Accepted | There is no publish credential in this repository. CI mints a short-lived one from its own OIDC identity — because a long-lived token has now failed silently twice, and npm is removing the option anyway. |

_14 records. Generated by `pnpm adr:index` — edit the ADRs, not this table._
<!-- adr-index:end -->
