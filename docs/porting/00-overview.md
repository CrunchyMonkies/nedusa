# nedusa — fork overview

`nedusa` is a hard fork of [Medusa](https://github.com/medusajs/medusa) that keeps the
commerce domain and replaces the infrastructure underneath it.

| | upstream Medusa | nedusa |
| --- | --- | --- |
| Base framework | hand-rolled loaders + express 4 | **NestJS 12** (express 5) |
| DI container | awilix 8, PROXY mode | **NestJS DI** |
| HTTP routing | file-based (`api/**/route.ts`) | **`@Controller` classes** |
| Workflow engine | in-house `TransactionOrchestrator` | **Temporal** |
| Package manager | Yarn Berry 3.2.1 | **pnpm workspaces** |
| ORM | MikroORM 6.6.14 | MikroORM 6.6.14 (unchanged) |
| Validation | Zod 4 | Zod 4 (unchanged) |

Vendor baseline is recorded in [`.upstream-version`](../../.upstream-version).

## The governing constraint: wire compatibility

**Upstream's HTTP contract is frozen as nedusa's specification.** Same routes, same
payloads, same status codes. This is not conservatism, it is what makes the fork
verifiable:

- Upstream's 207 integration specs (~1,813 test cases) remain a valid conformance harness.
- The admin dashboard and `@medusajs/js-sdk` keep working untouched.
- Route-table and OpenAPI parity become mechanical build gates rather than opinions.

Where NestJS idioms and Medusa's response shapes conflict, **Medusa wins**. Any deviation
from the contract is a bug, not a design choice.

## What deliberately does NOT diverge

Keeping these identical is what keeps the per-release port affordable:

- **Data models** (`model.define()` DML) and all 209 migrations.
- **Module services** — `MedusaService`, `MedusaInternalService`, the generated CRUD.
- **The transaction decorators** — `@InjectManager`, `@InjectTransactionManager`,
  `@MedusaContext`, `@EmitEvents`. These pass the EntityManager explicitly as the last
  argument with no ambient scope, so they port with zero changes.
- **Links and remote query** — `defineLink`, the link modules, `query.graph()`.
- **`MedusaError`** and its HTTP status mapping.

## What diverges, and why it is contained

The rewrite is concentrated in two layers:

1. **HTTP** — 330 route files, 84 middleware files. Mechanises well: every upstream route
   file uses the identical export shape, so the transform is signature-only.
2. **Workflows** — 345 workflows, 469 steps. Mechanises poorly and contains three
   subsystems that must be *redesigned* rather than ported (distributed locks, deferred
   event release, `runAsStep`).

Everything below those two layers is framework-agnostic plain TypeScript in upstream
already, and is re-wrapped rather than rewritten.

## Where the port currently is

**Phase 0 (pnpm foundation) — substantially complete.** Nothing has been ported to NestJS
or Temporal yet; the goal of this phase was to get upstream source building *unchanged*
under pnpm, so that later breakage is attributable to the port rather than the toolchain.

| | Status |
| --- | --- |
| Vendor baseline imported (`vendor/upstream` @ v2.21.1) | done |
| pnpm workspace, 85 projects discovered | done |
| Zero `@nedusa/*` resolved from the npm registry | verified |
| `pnpm build` | **83/83 tasks green** |
| `pnpm test` | **74/74 tasks green** (both earlier failures were transitive version drift; `msw` and `@ariakit/react` pinned to upstream's versions) |
| Test-runner concurrency capped | done — unbounded fan-out OOM-killed the dev VM |
| CI ported (root workflows) | done; `www/`-facing workflows still on yarn |
| Scope rename `@medusajs/*` → `@nedusa/*` | **not done — deliberately deferred to its own change** |

The scope rename is Phase 0's last step and was held back on purpose: it touches all 82
manifests plus every import, and doing it in the same change as the toolchain migration
would invalidate the build and test evidence above.

Phases 1-6 (Nest substrate, Temporal, API layer, modules, admin/CLI/docs, de-shimming)
have not started. The plan is in `~/.claude/plans/`.

## Reading order

| Doc | Read it when |
| --- | --- |
| [01-upstream-sync.md](01-upstream-sync.md) | **Porting a new upstream release.** The runbook. |
| [02-codemods.md](02-codemods.md) | A codemod misfired, or you need to extend one |
| [06-pnpm-conventions.md](06-pnpm-conventions.md) | Touching dependencies, scripts or CI |
| [adr/](adr/) | Asking "why is it like this?" |
