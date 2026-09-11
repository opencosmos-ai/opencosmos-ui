# 0003 — Ship a precompiled `dist/styles.css` rather than asking consumers to scan or safelist

**Date:** 2026-06-01 · **Status:** Accepted · **Relates to** [0004](0004-package-styles-ship-unlayered.md), [0005](0005-tailwind-class-names-are-never-interpolated.md)

_Consumers import one stylesheet and get every component class, because both alternatives — scanning `node_modules` and hand-keeping a safelist — fail silently and drop classes on every version bump._

## Context

Tailwind emits CSS only for class names it finds by scanning source files. A component library is a problem for that model: the classes live in `node_modules`, which Tailwind does not scan by default. Under Tailwind v4 with Turbopack it cannot be made to — `@source` pointed at a pnpm-symlinked `node_modules` path is silently ignored, with no warning and no error.

The workaround adopted in the consumer repository was a hand-written safelist: `apps/web/app/_ui-safelist.ts`, 245 lines of class names transcribed from the components so Tailwind would see them as literals. It worked the day it was written and degraded from then on. Every new component and every version bump added classes nobody transcribed, and the failure mode was a component quietly rendering without one of its rules.

It surfaced as a malformed Reset modal — full-bleed, edge to edge. `AlertDialog` uses the base `max-w-lg`; the safelist carried only `sm:max-w-lg`. The width constraint was never generated, so the dialog had no maximum width. Nothing errored. Two other apps had the same latent gap in a worse form: they imported components but none of the package's CSS at all.

Neither failure was really an app bug. The design system had shipped components without shipping a supported way to get their styles, and each consumer had improvised.

## Decision

`@opencosmos/ui` ships a precompiled stylesheet at `dist/styles.css`, exported as `@opencosmos/ui/styles.css`, containing every Tailwind utility the components use — responsive variants, `data-[state=…]` variants, the `tailwindcss-animate` family, and the custom `animate-fade-in` / `scrollbar-hide` utilities included.

Consumers import it and are done:

```css
@import "tailwindcss";
@import "@opencosmos/ui/theme.css";
@import "@opencosmos/ui/globals.css";
@import "@opencosmos/ui/styles.css";
```

No `content` glob, no `@source`, no safelist. Upgrading the package brings new components' classes with it.

The build is `packages/ui/styles.src.css` compiled by the Tailwind CLI. Two things about that file are load-bearing and look wrong to anyone who has not read this record:

- It imports `tailwindcss/utilities.css`, **not** `tailwindcss`. The full entry point would emit Tailwind's preflight base resets into every consumer, on top of whatever resets that app already has.
- It pulls the design tokens in through `@reference "./src/theme.tokens.css"`, so `bg-primary` and `text-foreground` resolve during generation but no `:root` variables are emitted. The stylesheet references theme token values; it never sets them, so it cannot clobber the values `ThemeProvider` writes.

`@source "./src"` at the bottom is what makes the file self-maintaining: it scans this package's own source, in this package's own build, where symlinks are not involved.

## Consequences

- Adding a component requires no consumer-side action beyond a version bump. This is the property the safelist could never have.
- Roughly 100 KB of additional raw CSS per app — the full component set, whether or not an app uses all of it — heavily compressed over the wire. Correctness and zero maintenance were judged worth a few KB gzipped.
- **Import order matters and is not enforced.** `styles.css` must come after `globals.css`. Get it wrong and the failure is visual, not diagnostic.
- The stylesheet is only as complete as the last build. A stale `dist/` means missing classes, which is why the documented first troubleshooting step is `pnpm --filter @opencosmos/ui build`.
- Emitting unlayered utilities is a direct consequence of importing `tailwindcss/utilities.css`, and it changes the cascade in consuming apps. That is significant enough to have its own record — [0004](0004-package-styles-ship-unlayered.md).
- The first release of this shipped incomplete: the `tailwindcss-animate` family was never emitted, so every overlay component's enter/exit animation silently no-op'd in consuming apps until 1.9.1. A precompiled stylesheet moves the failure from "class missing in one app" to "class missing in all of them," which is better only because it gets noticed.

## Alternatives considered

- **A `content` / `@source` glob over `node_modules`.** Rejected: it does not work under Tailwind v4 + Turbopack with pnpm symlinks, and it fails by emitting nothing rather than by erroring.
- **A consumer-side safelist.** Rejected — this is what was replaced. It requires every consumer to re-derive the library's internals by hand and to redo it on every upgrade, and it is wrong the moment a component changes a class.
- **Shipping plain CSS with hand-written class names instead of Tailwind utilities.** Rejected: it would decouple the components from the token system, and every value would have to be maintained twice.
- **A Tailwind preset or plugin the consumer registers.** Rejected: it still requires the consumer's Tailwind build to see the class names, which is the problem being solved, not a solution to it.
