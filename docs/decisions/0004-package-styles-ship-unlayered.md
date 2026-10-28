# 0004 — Component styles ship unlayered; consumers override at the call site with `!`

**Date:** 2026-06-01 · **Status:** Accepted · **Relates to** [0003](0003-precompiled-styles-css-over-a-consumer-safelist.md)

_`styles.css` emits unlayered utilities, which outrank an app's own layered Tailwind, so an override belongs on the element as `class!` — never on the app's global imports._

## Context

Tailwind v4's `@import "tailwindcss"` declares `@layer theme, base, components, utilities;` and wraps everything it generates inside those layers. An app's `bg-red-500` is therefore a rule inside `@layer utilities`.

`@opencosmos/ui/styles.css` is not. It is built from `tailwindcss/utilities.css` — the bare `@tailwind utilities` directive with no enclosing layer — because importing the full entry point would drag Tailwind's preflight into every consumer ([0003](0003-precompiled-styles-css-over-a-consumer-safelist.md)). The compiled output declares exactly one layer, `@layer properties`, and that is only Tailwind's `@property` fallback shim for the `--tw-*` custom properties. Every actual utility rule in the file is unlayered.

In the CSS cascade, unlayered normal declarations beat layered ones outright, regardless of specificity or source order. So a consumer writing `<Card className="bg-red-500">` finds the app's `bg-red-500` losing to the component's own `bg-card`. Nothing errors; the class is present in the DOM and simply does not win.

The tempting fix is global: wrap the package's imports in a cascade layer of the app's own — `@import "@opencosmos/ui/styles.css" layer(opencosmos)` — and declare it before `utilities`. That makes the override work. It also demotes every component style in the system below every app utility, at once, invisibly. The design system's carefully-ordered internals now lose to any app rule that happens to collide, in places nobody was looking. It converts one local override into a global change of precedence, and the resulting breakage does not point back at the line that caused it.

## Decision

The package's stylesheet stays unlayered. Consumers override a component's styling **at the call site, with Tailwind's important modifier**:

```tsx
// ✅ Localized. Wins, and only here.
<Card className="bg-red-500!" />

// ❌ Global. Silently re-ranks every component style in the app.
@import "@opencosmos/ui/styles.css" layer(opencosmos);
```

An important declaration in a layer beats an unlayered normal declaration, so `bg-red-500!` wins — and its blast radius is one element.

This is the escape hatch, not the working pattern. A component that needs a different look in more than one place needs a prop or a variant in the library, not an important modifier repeated across an app. That is the rule the `create` skill already states: change it in the design system, not in the consuming app.

## Consequences

- Component styling is stable by default. An app cannot accidentally restyle a component by having a same-named utility in scope.
- Overrides are visible in the JSX, where the person reading the component can see them, rather than in a CSS import three files away.
- **The `!` is required and the failure without it is silent.** A consumer who does not know this writes `className="bg-red-500"`, sees nothing happen, and has no error to search for.
- An app cannot globally re-theme components through CSS. It goes through tokens (`--color-*`, which `ThemeProvider` sets — see [0013](0013-themeprovider-owns-the-dark-class.md)) or through the component's props. That is the intended direction and the reason overriding is deliberately inconvenient.
- Tailwind v4 moved the important modifier to a suffix. `bg-red-500!` is correct; the v3 prefix form `!bg-red-500` is not.
- This behaviour was never chosen for its own sake — it fell out of [0003](0003-precompiled-styles-css-over-a-consumer-safelist.md). It is recorded as a decision because it is now part of the contract with every consumer, and because the natural reaction to discovering it is the global fix that this record rejects.

## Alternatives considered

- **Consumers wrap the package import in their own cascade layer.** Rejected: it fixes one override by re-ranking every component style in the application. The cost is unbounded and shows up far from the change.
- **Emit `styles.css` into a named layer the package declares.** Rejected for the same reason in the other direction — it hands every app utility precedence over every component rule by default, which is exactly the fragility the precompiled stylesheet was built to remove. If this is ever revisited it needs a deliberate layer order published as part of the package's API, and a supersession of this record.
- **Ship the full `@import "tailwindcss"` so everything lands in `@layer utilities` consistently.** Rejected: it re-emits preflight and the default `@theme` into every consumer, which is the problem [0003](0003-precompiled-styles-css-over-a-consumer-safelist.md) exists to avoid.
- **Tell consumers to raise specificity instead (`[&]:bg-red-500`).** Rejected: specificity does not cross layers. No amount of it beats an unlayered rule.
