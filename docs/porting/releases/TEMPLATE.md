# Port report: upstream vX.Y.Z

Copy this to `docs/porting/releases/vX.Y.Z.md` when porting a release. Three of these and
the cost of the next one becomes predictable.

- **From → to:** vA.B.C → vX.Y.Z
- **Ported by:**
- **Dates:** started … / finished …
- **Elapsed:** … working days

## Upstream delta

| Area | Commits | Notes |
| --- | --- | --- |
| `packages/modules/**` (domain) | | |
| `packages/medusa/src/api` (routes) | | |
| `packages/core/core-flows` (workflows) | | |
| `packages/core/framework/src/http` | | **replaced in nedusa — triage by hand** |
| `packages/core/orchestration`, `workflows-sdk` | | **deleted in nedusa — triage by hand** |
| build / CI / workspace | | |

Breaking changes announced in upstream's changesets:

## Codemods

| Codemod | Files touched | Clean | Needed extending? |
| --- | --- | --- | --- |
| `yarn-to-pnpm` | | | |
| `route-to-controller` | | | |
| `middlewares-to-decorators` | | | |
| `step-to-activity` | | | |
| `workflow-to-temporal` | | | |

Any codemod that needed extending — describe the new case, so the next porter recognises
it. If you hand-edited vendored source instead of extending a codemod, say so explicitly
and explain why; that debt is re-paid every release.

## Gates

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | |
| zero `@nedusa/*` from the registry | |
| `pnpm build` | |
| `pnpm parity:check` (route table) | |
| `pnpm oas:diff` (response shapes) | |
| `pnpm test` | |
| `pnpm test:replay` (workflow determinism) | |
| `pnpm test:integration:http` | / 121 |
| `pnpm test:integration:modules` | / 86 |

## What broke, and what it cost

The most useful section. Be specific about the surprises — the things that cost hours
rather than the things that went to plan.

## Unported

Added to [`../UNPORTED.md`](../UNPORTED.md):

## For next time

One or two concrete changes that would have made this port cheaper.
