# 0007 — `@opencosmos/tokens` is a package of its own

**Date:** 2026-02-16 · **Status:** Accepted

_The design language is published independently of the components that consume it, so a product can adopt the palette, type scale, and motion curves without importing React._

## Context

Colours, typography, spacing, motion curves, effects, and syntax-highlighting themes for Studio, Terra, Volt, and Speedboat are data. They have no dependencies at all — the package's dependency list is empty — and they are what makes an OpenCosmos surface look like OpenCosmos.

The components in `@opencosmos/ui` consume them, but they are not the only possible consumer. A marketing page, a Figma sync, a native surface, a chart library, or an email template needs the same values and none of the components. The Speedboat theme exists precisely because a partner design language was brought in as tokens without any expectation that the components would follow.

Folding tokens into `@opencosmos/ui` would mean the only way to get a hex value is to install a React component library.

## Decision

Tokens ship as `@opencosmos/tokens`, at the root of the dependency chain:

```
@opencosmos/tokens  (no dependencies)
      ↓
@opencosmos/ui  →  @opencosmos/mcp
      ↓
apps/web
```

`@opencosmos/ui` depends on it at runtime and re-exports it at `@opencosmos/ui/tokens`, so a consumer that already has the component library needs no second install. A consumer that wants only the design language installs only the tokens.

Tokens are values, not CSS. Turning them into CSS custom properties is `ThemeProvider`'s job in `@opencosmos/ui`, which is what makes runtime theme switching possible ([0013](0013-themeprovider-owns-the-dark-class.md)).

## Consequences

- The design language is usable outside React, and outside this design system entirely.
- Two packages to version and release when a token changes, though Changesets handles the internal range bump ([0006](0006-changesets-driven-release-through-ci.md)).
- The dependency edge is real and was once missing: `@opencosmos/tokens` was imported at runtime by the UI root barrel but absent from its `dependencies`, so the package worked in this monorepo and was broken on npm. Fixed in 1.10.1. A workspace boundary is only enforced if the manifest declares it.
- `THEME_NAMES` includes `speedboat`, which is a partner theme and is deliberately excluded from the public theme list surfaced to users. The token package holds more than the product exposes.

## Alternatives considered

- **Tokens as a subdirectory of `@opencosmos/ui`.** Rejected: it makes React a prerequisite for using a colour value, and it means every token change ships a component-library release.
- **A JSON file or a Style Dictionary build consumed at build time.** Rejected: the tokens are typed TypeScript with derived values — `getDuration(motionIntensity)` computes from the theme's motion personality rather than storing a constant. That behaviour does not survive serialization to JSON.
- **Tokens in the consumer repository.** Rejected: it inverts the dependency and makes the design language a property of one product rather than of the system.
