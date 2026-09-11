# 0012 — Motion intensity 0 is a first-class rendering mode, not a degradation

**Date:** 2026-02-16 · **Status:** Accepted

_Every animating component must check `useMotionPreference()` and render correctly with no animation at all, because motion is a user setting here — not only an accessibility fallback._

## Context

Most design systems treat reduced motion as an accessibility concession: honour `prefers-reduced-motion`, ship a stripped-down version, accept that it looks a bit broken. The unanimated path is the one nobody tests.

That is not tenable here for two reasons. The first is the philosophy — User Control & Freedom is one of the four principles, and it means a user can set motion anywhere on a 0–10 scale from the Customizer at runtime, for reasons that are theirs. Someone at 0 is not receiving a degraded experience; they are receiving the one they chose.

The second is mechanical. `useMotionPreference()` returns `shouldAnimate: motion > 0 && !prefersReducedMotion`, so the system-level preference and the user's dial land in the same boolean and neither is privileged. Both flip at runtime — the hook subscribes to the `prefers-reduced-motion` media query and to the Customizer store. A component that hardcodes animation is not just inaccessible; it ignores a live setting and will visibly disagree with the rest of the page.

A component whose entrance is a fade-in from `opacity: 0` and which never checks the hook does not render "less animated" at intensity 0. It renders invisible.

## Decision

Any component that animates calls `useMotionPreference()` and takes a real branch on `shouldAnimate`. At intensity 0 the component reaches its final state instantly and completely: state changes still happen, nothing is hidden, nothing is mid-transition, nothing is missing.

`scale` (0–10) modulates duration and distance for everything in between; it is not a binary.

This is an invariant, not a suggestion, and it is the first item on the accessibility checklist every component must pass — alongside keyboard navigability with visible focus, screen-reader compatibility, WCAG AA contrast, and never conveying information by colour alone.

**Consumers do not get to override it.** There is no prop to force animation past a user's setting. An app that wants motion asks the user for it through the Customizer.

## Consequences

- Every animating component carries two code paths, and the unanimated one has to be designed rather than derived. This is real additional work per component.
- The zero path is the one most likely to rot, because it is not what anyone looks at while building. Reviewing a component at intensity 0 is not optional.
- Because both the system preference and the user dial resolve through one hook, a component that uses the hook honours both for free — and a component that reimplements the media query honours neither correctly.
- Duration CSS variables (`--duration-default`, `--duration-fast`, `--duration-slow`) are computed from the active theme's motion personality and re-injected by `ThemeProvider` when intensity changes, so CSS transitions follow the setting without each component wiring it up.
- Motion is a per-theme personality, not a global constant: the same intensity produces different curves and durations under Studio, Terra, and Volt.

## Alternatives considered

- **Honour `prefers-reduced-motion` only.** Rejected: it makes motion a binary accessibility flag rather than a user preference, and it gives someone who simply dislikes movement no way to say so short of changing an OS setting.
- **Let intensity 0 be a degraded mode.** Rejected outright. It is the mode some users will always be in, so it is the mode that has to be good. Treating it as a fallback guarantees it is nobody's job.
- **A consumer-level opt-out prop.** Rejected: it lets an app override a choice the user made about their own experience, which inverts the principle the setting exists to serve.
