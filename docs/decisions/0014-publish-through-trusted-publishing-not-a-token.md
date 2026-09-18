# 0014 — Publish through npm trusted publishing, not a token

**Date:** 2026-09-18 · **Status:** Accepted · **Relates to** [0006](0006-changesets-driven-release-through-ci.md)

_There is no publish credential in this repository. CI mints a short-lived one from its own OIDC identity — because a long-lived token has now failed silently twice, and npm is removing the option anyway._

## Context

[0006](0006-changesets-driven-release-through-ci.md) records that publishing "requires a working `NPM_TOKEN` in CI", and that this had already bitten once: `1.9.0` was version-bumped, merged, and never published, because the token had expired and npm returned a 404 that read like a missing package. The version sat in git and in the changelog and not on npm for two weeks.

**It happened again on 18 September 2026**, in the same shape. Every package failed with `E404 … could not be found or you do not have permission to access it` — npm answers an authorization failure with 404 rather than 403, so the error names the package rather than the credential.

The arithmetic is exact. The token was set on 18 June; npm has capped granular access tokens at a **90-day** lifespan since February 2026; 18 June + 90 days is **16 September**. The last successful publish was day 60, the failure was day 92. Rotating it buys ninety days and the same failure, and npm removes direct publish from these tokens entirely in **January 2027**.

What made it invisible for a month is that `release.yml` had run green on 11 September. **Changesets exits 0 when there are no changesets to publish**, so a green Release run means "nothing to do", not "publishing works". The failure could only be discovered by needing a release.

**This is the second attempt at trusted publishing.** The first shipped in February 2026 (`ade93ea`, `16d7303`, `843e7bb`) and silently did not work; on 11 April `1e247f2` added `NODE_AUTH_TOKEN` back to make publishing succeed. `docs/CICD-PIPELINE.md` was rewritten in February to say "No `NPM_TOKEN` secret is needed" and was never reverted, so the documentation described this decision five months before it was true.

The first attempt failed for a reason worth stating precisely, because it is invisible and it is the thing most likely to undo this decision.

## Decision

Publish with **npm trusted publishing (OIDC)**. No publish credential is stored in this repository.

1. `release.yml` carries `id-token: write`. GitHub mints an OIDC token; npm exchanges it for short-lived publish credentials scoped to this repository and this workflow file.
2. **`registry-url:` must not be set on `actions/setup-node`.** It writes `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` into `.npmrc`. With no token in the environment that expands to an **empty string**, and npm reads an empty token as *auth is already configured* — so it never begins the OIDC exchange and fails with `E404`, **the same signature as an expired token**. This is why the February attempt failed and why the repair looked like "put the token back". npmjs.org is the default registry, so omitting it changes nothing else. `actions/setup-node@v6` removes the dummy fallback; until this repository is on v6, the absence of that line is load-bearing and a comment at the call site says so.
3. `changesets/action@v2` and `@changesets/cli@3`. v1 has no OIDC path — it only ever wrote its own `.npmrc` when `NPM_TOKEN` was set. v2 removed token handling entirely and requires Changesets v3.
4. npm is upgraded in-job (`npm install -g npm@latest`); trusted publishing needs **npm >= 11.5.1**, which Node 24 does not reliably ship.
5. `release.yml` carries `workflow_dispatch`, so the publish path can be exercised without landing a release.
6. Each published package has a Trusted Publisher on npmjs.com naming `opencosmos-ai` / `opencosmos-ui` / `release.yml` — **the workflow filename only, not the path**.

## Consequences

- **There is no credential to expire, rotate, or leak.** The `NPM_TOKEN` secret was deleted on 18 September 2026.
- **A new published package needs its own Trusted Publisher entry before its first release**, configured by hand on npmjs.com. Adding a fifth package to this repository is therefore not purely a code change, and its first publish will fail with the same misleading `E404` if the entry is missing. Whether a brand-new package can be registered before it has ever been published, or needs one manual publish first, is untested here — check it when adding one.
- **Renaming `release.yml`, or moving the publish to a different workflow file, breaks publishing** until every package's Trusted Publisher is updated. The filename is part of the credential.
- Publishing is bound to this repository. It broke nothing when the repository moved to the organization — the entries name the new path — but a future transfer means updating all of them.
- Provenance is attached automatically, so every published version is traceable to the commit and workflow that built it.
- **A release is verified against the registry, never against the workflow's conclusion.** This is not belt-and-braces. On the first OIDC release the run concluded `success`, printed "Successfully published" listing all four packages, and created git tags and GitHub releases for all four — while `@opencosmos/ui@1.10.4` was never published. Its own progress counter went 2/4 → 3/4 and never reached 4/4, and no error was logged. A `workflow_dispatch` re-run published the missing package. **Changesets has claimed a publish it did not perform**, so 0006's rule — *a merged Version Packages PR is not evidence that a version is on npm* — now extends to the release run's own success message. Check `npm view <pkg> version`.

## Alternatives considered

- **Rotate the token and move on.** Rejected: a 90-day cap makes this a recurring silent failure with a 90-day period, and January 2027 removes direct publish from these tokens regardless. The failure mode is the problem, not the expiry date — an expired token produces a 404 that reads like a missing package, which is how it cost two weeks in 0006 and a month here.
- **A calendar reminder to rotate before expiry.** Rejected: 0006 already wrote down the lesson from the `1.9.0` incident, in the clearest terms, and it did not prevent the recurrence. A written rule that depends on someone remembering is not a control.
- **Staged publishing with maintainer approval.** npm's other supported path: CI stages, a maintainer approves with 2FA. Rejected for now — it puts a human in every release, which is the thing 0006 automated away. Worth revisiting if this repository ever publishes something that warrants a human gate.
