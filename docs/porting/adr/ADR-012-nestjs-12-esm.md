# ADR-012: NestJS 12, and therefore an ESM boundary

**Status:** accepted · **Date:** 2026-09-23 · **Phase:** 1

## Context

The plan pinned NestJS 12.0.4 on the grounds that it ships Express 5.2.1 and
path-to-regexp 8.4.2, which the port requires.

Standing up `apps/server` surfaced something the plan did not anticipate:

```
$ node -e "console.log(require('@nestjs/core/package.json').type)"
module
```

**NestJS 12 is ESM-only** — `"type": "module"` with no CommonJS export condition.
Medusa is CommonJS across all 8,400 files (`module: Node16`, no `"type": "module"`
anywhere). TypeScript rejects the import outright:

```
src/main.ts(3,29): error TS1479: The current file is a CommonJS module whose imports
will produce 'require' calls; however, the referenced file is an ECMAScript module
and cannot be imported with 'require'.
```

The alternative was not obvious and is worth recording: **NestJS 11.2.5 is CommonJS and
ships the identical Express 5.2.1 and path-to-regexp 8.4.2.** The Express 5 requirement
is met by either. The only difference that mattered was the module format.

Nest 11 would additionally have unlocked the three ecosystem integrations that
[the pnpm conventions](../06-pnpm-conventions.md) records as unusable — `@mikro-orm/nestjs`
6.1.x (which supports MikroORM 6, as Medusa uses), `nestjs-zod`, and `nestjs-temporal` all
peer on Nest ≤11 and none support 12.

## Decision

**NestJS 12, with `apps/server` as the workspace's only ESM package.** Everything vendored
from Medusa stays CommonJS.

The dependency direction makes this workable: ESM can import CommonJS, and the Nest layer
imports Medusa, never the reverse.

## Evidence gathered before committing to it

The material risk is that **named** imports from CommonJS are recovered by
`cjs-module-lexer`, which is a static analyser and can fail on re-export barrels — and
Medusa is built almost entirely from `export * from` barrels. If that failed, every import
in the Nest layer would have to be rewritten as a default import plus destructuring.

Probed directly against the real built packages before building anything on top:

| Specifier | Named exports visible |
| --- | --- |
| `@nedusa/utils` | 652 |
| `@nedusa/types` | 56 |
| `@nedusa/framework/utils` | 652 |
| `@nedusa/framework/types` | 56 |
| `@nedusa/framework/http` | 37 |
| `@nedusa/modules-sdk` | 25 |
| `@nedusa/workflows-sdk` | 17 |
| `@nedusa/core-flows` | 1,409 |

All eight resolve, with named imports intact. The barrels survive the lexer.

The second risk is the conformance harness: `bootstrap-app.ts` is CommonJS and must create
the ESM Nest app, and 207 spec files depend on it. Probed the same way:

```
OK   dynamic import of the ESM Nest app from CommonJS
     exports: bootstrap
OK   bootstrap() returned a Nest app; express instance: function
OK   app.close() clean
```

CommonJS cannot `require()` ESM, but `await import()` works and the function is already
async. Both directions across the boundary are therefore proven before any substrate is
built on them.

## Consequences

**Accepted:**

- `apps/server` declares `"type": "module"`; relative imports carry an explicit `.js`
  extension, and `require.main === module` becomes an `import.meta.url` comparison.
- `bootstrap-app.ts` in `@nedusa/test-utils` is CommonJS and must reach the Nest app via
  **dynamic `await import()`**. CommonJS cannot `require()` ESM, but it can dynamically
  import it, and that function is already async. This is the conformance harness, so it
  has to work — verify it early in Phase 1.
- `__dirname` and `require` are unavailable in the Nest layer.
- Jest with ESM across 71 projects is awkward. The Nest layer's own tests will need
  handling separately from the `@swc/jest` CommonJS setup the rest of the repo uses.
- `@nedusa/nest-database`, the Zod pipe and `@nedusa/nest-temporal` stay hand-written.

**Revisit if:** the ESM boundary costs more than expected in Phase 3 or the Temporal
worker. Moving to Nest 11 is a downgrade in major version but not in capability — Express
5 and path-to-regexp 8 are identical — so it remains a genuine escape hatch rather than a
rewrite.
