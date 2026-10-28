# 0015 — The commons for play lives beside the design system

**Date:** 2026-09-27 · **Status:** Accepted

_Game-design principles — and later the Swift export of the tokens and a haptic vocabulary — are published here, because this repository is where the ecosystem keeps what it shares about how to design, and the games are expressions of the same philosophy._

## Context

The ecosystem now builds games: Xensō (a game you play as yourself, first on the web at opencosmos.ai/xenso and now as a native iOS app) and a game for children in development. Their strategy, code, and art are private and commercial — they are meant to sustain the family that makes them. But much of what they have learned is not a trade secret: an ethic of play, a way to earn without extracting, accessibility at play, and soon reusable design artifacts.

The opencosmos root ADR 0018 already fixed the test for where things live: **not "what is it about" but "who is invited to it, and on what terms."** The games themselves fail that test for the org — they are not contributable. Their foundations pass it: anyone building a game is invited to use and argue with them.

This repository already holds the philosophy those foundations extend ([DESIGN-PHILOSOPHY.md](../../DESIGN-PHILOSOPHY.md)), the tokens a native app would draw from, and the motion invariant ([0012](0012-motion-intensity-zero-is-a-first-class-mode.md)) that a game must honour as much as a component does.

## Decision

The commons for play lives here, under `docs/games/`, MIT like the rest of the repository. It starts with [PLAY-PRINCIPLES.md](../games/PLAY-PRINCIPLES.md), generalized from the games' canon with nothing private in it. DESIGN-PHILOSOPHY lists the games as expressions of the one mind.

Planned, not built: a Swift export of `@opencosmos/tokens` so native games share the web's design language, and a documented haptic vocabulary. Each gets its own record when it lands, because a new build target is a load-bearing change in a way a document is not.

## Consequences

- A repository whose packages are React now also carries documents for native games. Contributors to the components can ignore `docs/games/`; nothing in the build reads it.
- What is private stays private: the games' strategy lives in a private studio repository, and moving anything from there to here means generalizing it first — no business specifics, no personal details.
- A decision spanning the studio and this repository is recorded on both sides (0018's lesson).

## Alternatives considered

- **A new `opencosmos-ai/play` repository.** Cleanest by 0018's logic if the commons for play grows large. Rejected for now: one document does not earn a repository, and the tokens export — the most likely next contribution — belongs beside the tokens. Revisit if `docs/games/` outgrows a folder.
- **Keep everything in the private studio.** Rejected: it hides what is generous by design, which contradicts the fourth principle.
- **The cosmo repository.** Rejected: Cosmo's constitution is about Cosmo; these principles are about games, most of which will have no Cosmo in them.
