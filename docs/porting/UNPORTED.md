# Unported upstream changes

Anything consciously **not** carried across from upstream is recorded here with the
upstream SHA and the reason. An unported commit that is written down is a decision; one
that is not is a bug waiting to be rediscovered.

Add an entry whenever you skip an upstream change, including when the affected code no
longer exists in nedusa.

| Upstream ref | Area | What | Why unported |
| --- | --- | --- | --- |
| _(none yet — v2.21.1 is the vendor baseline)_ | | | |

## Permanently diverged areas

Upstream changes to these paths never merge cleanly, because nedusa has deleted or
replaced the code. Expect to triage them by hand on every release.

| Upstream path | nedusa status |
| --- | --- |
| `packages/core/framework/src/http/**` | Replaced by the NestJS layer |
| `packages/core/orchestration/**` | Deleted; replaced by Temporal |
| `packages/core/workflows-sdk/src/utils/composer/**` | Deleted; the DSL is compiled away |
| `packages/modules/workflow-engine-{inmemory,redis}` | Deleted; replaced by Temporal |
| `packages/medusa/src/loaders/**` | Replaced by Nest bootstrap |
| `packages/medusa/src/commands/**` | Reworked for the Nest + Temporal runtime |
| `packages/core/core-flows/**/steps/*` (locking) | `acquireLockStep` / `releaseLockStep` deleted; replaced by Temporal workflow-ID uniqueness |
| `packages/core/core-flows/src/common/steps/emit-event.ts` | Redesigned as a workflow-local buffer with a single flush |

## Deliberate behaviour changes

Differences introduced on purpose, with the reasoning recorded in an ADR.

| Change | Reason |
| --- | --- |
| Wildcard route patterns use `{/*splat}`, not upstream's `{*splat}` | Upstream's `RoutesFinder` shim rewrites `/admin/orders/*` to `/admin/orders{*splat}`, which also matches `/admin/ordersXYZ`. `{/*splat}` preserves the segment boundary. |
| Route precedence is explicit rather than computed at runtime | Nest resolves in registration order; upstream sorts at boot. Guarded by three CI drift tests. |
| `prepare` scripts relocated to `build:prod` | `prepare` runs during install, before turbo has built workspace dependencies. Redundant for publishing. |
| Two dependencies pinned below their satisfiable range (`msw` 2.12.4, `@ariakit/react` 0.4.20) | There is no yarn→pnpm lockfile conversion, so every transitive dependency re-resolves: 308 of 1,680 shared packages landed on different versions than upstream. These two broke tests. Pinned to upstream's versions; revisit on each upstream import. See `06-pnpm-conventions.md` §12. |
| Turbo upgraded to v2 while upstream stays on v1 | Turbo 1.13.4 cannot parse pnpm's v9 lockfile and silently produces an empty dependency graph. `turbo.json` will conflict on every upstream change. See `adr/ADR-007-turbo-v2.md`. |
| Test-runner concurrency capped (`maxWorkers: 4`, `turbo --concurrency`) | Unbounded fan-out across 85 workspaces OOM-killed the dev VM. See `06-pnpm-conventions.md` §13. |
| The dual path-to-regexp dialect is collapsed to one | Upstream compiles matchers with v8 in `routes-finder.ts` but registers them on express 4's 0.1.7 in `router.ts`. The two disagree — a latent upstream bug. Collapsing changes behaviour for any route where they differed. |
