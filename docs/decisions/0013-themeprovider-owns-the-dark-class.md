# 0013 — `ThemeProvider` owns the `dark` class; never hardcode it on an element

**Date:** 2026-08-16 · **Status:** Accepted · **Relates to** [0007](0007-tokens-as-a-separate-package.md)

_Dark-mode token values live under a bare `.dark` selector, so any element carrying that class re-pins every token for its whole subtree and makes the theme customizer look broken._

## Context

`packages/ui/src/globals.css` defines dark-mode values as `.dark { --color-background: …; … }` — a bare class selector, not `:root.dark`. `ThemeProvider` toggles `dark` on `<html>`, and that is where the rule is meant to match.

But a bare class selector matches anywhere. Put `dark` on a `<div>` and every CSS custom property is redefined for that element and everything inside it, permanently, regardless of what `ThemeProvider` and the Customizer set on `<html>`.

This has a specific and very confusing symptom. The pattern `<HeroBlock className="min-h-screen dark bg-background">` is deliberate and correct on a marketing page that wants a permanently dark hero. Copied onto a consumer's top-level layout wrapper — a natural thing to lift from a page that looks good — it pins most of the visible page to dark values. The Customizer panel itself sits outside that subtree and updates normally, so the user sees the control respond while the page behind it does not move. It reads as "the theme system is broken." Nothing appears in the console.

The same shape applies to `light`.

## Decision

`ThemeProvider` is the only thing that sets `dark` or `light`, and it sets it on `<html>`. Application code does not write either class onto an element.

The one legitimate exception is a section deliberately opted out of the user's theme — a brand-locked hero that should be dark for every reader regardless of preference. That is a considered choice about one block, never a default on a layout wrapper, and never something copied in from another page without deciding it again.

```tsx
// ❌ This subtree is now permanently dark. Theme switching does nothing to it.
<HeroBlock className="min-h-screen dark bg-background" />

// ✅ Inherits whatever ThemeProvider currently has active.
<HeroBlock className="min-h-screen bg-background" />
```

Theming happens through tokens. A component that needs different colours in dark mode reads `bg-background` / `text-foreground` and lets the token values change underneath it.

## Consequences

- Theme and mode switching are genuinely global and genuinely runtime, which is what makes the Customizer work at all.
- The bare `.dark` selector is retained deliberately — it is what allows the intentional opt-out above. The cost is that the footgun stays loaded, mitigated by documentation rather than by the selector.
- A related trap sits next to this one and has the same silent-failure character: `ThemeProvider` sets `--font-heading`, `--font-body`, and `--font-mono`, but nothing in the package ever applies them. No component sets `font-family` from them and neither `theme.css` nor `globals.css` sets a base font-family. A consumer that does not wire `font-family: var(--font-body)` onto `body` themselves gets every theme rendering correct colours in the browser's default typeface, with no error. Both were found the same way — integrating the library into a real app — and shipped as documentation in 1.10.2.
- Because tokens are the theming mechanism, a consumer cannot re-theme by overriding component CSS. That direction is closed by [0004](0004-package-styles-ship-unlayered.md), and this is the door that is open instead.

## Alternatives considered

- **Scope the selector to `:root.dark`.** It would make the mistake impossible, and it was not taken because it also removes the intentional per-section opt-out that a marketing page relies on. This is the strongest candidate for a future supersession: if the opt-out were expressed some other way — a data attribute, or an explicit `ThemeScope` component — the bare selector could be tightened and the footgun removed entirely.
- **A `forceDark` prop on components.** Rejected: it would need to exist on every component and would not help the layout-wrapper case that actually causes the confusion.
- **Detect and warn at runtime when `dark` appears outside `<html>`.** Not rejected on merits; it would turn a silent failure into a console warning, which is most of the value. It has not been built.
