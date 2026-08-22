# 0011 — No eager JSX in the Studio registry's `examples[].children`

**Date:** 2026-04-03 · **Status:** Accepted · **Relates to** [0010](0010-context-hooks-return-a-safe-default.md)

_`component-registry.tsx` is a module-level object, so JSX in it calls `createElement` at import time — one undefined export takes down every docs page that imports the module, not just its own._

## Context

`apps/web/app/components/lib/component-registry.tsx` describes every component for the Studio playground. Some entries carried live JSX in `examples[].children`:

```tsx
examples: [{ label: 'With provider', children: <AppSidebarProvider><AppSidebar /></AppSidebarProvider> }]
```

JSX in an object literal is not lazy. `React.createElement(AppSidebarProvider, ...)` runs when the module is first imported, before any page renders. If any component referenced there is `undefined`, the module throws on import.

That happened. A Turbo remote cache restored a `@opencosmos/ui` `dist/` predating `AppSidebar`, so `AppSidebar` and `AppSidebarProvider` were both `undefined`, and the registry module crashed at load. Because every docs page in a category imports the registry, the whole category returned 500 — pages for components that had nothing to do with `AppSidebar` and were entirely fine. The React error named a component nobody was looking at.

The blast radius is what makes this worth a record. A single stale export in a single example took out a section of the site, and the error pointed nowhere near the cause.

Provider-dependent components make it worse in a second way: the registry has no place to put the Provider wrapper, so the JSX has to carry it, which is exactly the JSX that fails.

## Decision

**Components that need a Provider wrapper carry metadata-only examples in the registry.** No JSX:

```tsx
examples: [{ label: 'With provider', props: {} }]
```

The live preview is rendered by a dedicated branch in `EnhancedComponentPlayground.tsx`, keyed on the component name — see the `componentName === 'AppSidebar'` branch, which does the Provider wrapping. That code path runs at render time, inside a component, where a failure is contained to one page.

The playground also guards against an `undefined` component and renders a fallback message rather than calling `createElement` on nothing.

To find violators before they ship:

```bash
grep -n "children: (" apps/web/app/components/lib/component-registry.tsx
```

Any hit referencing a component that needs a Provider is a time bomb.

## Consequences

- Provider-dependent components need a hand-written playground branch, which is more work per component and does not scale gracefully — the playground accumulates a special case per such component.
- Roughly forty registry entries still use eager JSX children. They are safe today because none of them needs a Provider and none is new enough to be missing from a cached `dist/`. The pattern remains a live hazard for the next component that is both.
- The stale-cache trigger was separately mitigated: `vercel.json` at the repository root passes `--force` to bypass the Turbo remote cache on deploys. That reduces the frequency of the trigger without addressing the fragility, which is why this rule still stands.
- The grep check is manual. Nothing in CI enforces it.

## Alternatives considered

- **Make `children` a thunk — `children: () => <JSX/>` — so it evaluates lazily.** Rejected at the time in favour of the playground branch, which also solves the Provider-wrapping problem the registry has no structure for. It remains the better general fix for the forty entries that still evaluate eagerly, and adopting it would supersede half of this record.
- **Only fix the Turbo cache.** Rejected: `--force` on deploys removes one way to get a stale `dist/`, not all of them, and it does nothing about the underlying property that one bad reference kills the whole module.
- **Split the registry into one module per component.** Rejected as disproportionate; it would contain the blast radius but replaces one navigable file with a hundred.
