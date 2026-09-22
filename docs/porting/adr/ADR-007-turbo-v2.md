# ADR-007: Turbo must be v2, and it is not a cleanup

**Status:** accepted · **Date:** 2026-09-23 · **Phase:** 0

## Context

Upstream pins `turbo ^1.6.3`, resolving to 1.13.4. The Phase 0 plan listed the turbo v1→v2
upgrade as an optional tidy-up ("`pipeline` → `tasks`, tighten `outputs`") to be done
after the pnpm migration was proven green, on the principle that Phase 0 should change as
little as possible.

That ordering turned out to be impossible.

## What actually happened

With turbo 1.13.4 and a pnpm v9 lockfile, `pnpm build` failed like this:

```
@medusajs/analytics-local:build: src/index.ts(1,41): error TS2307:
  Cannot find module '@medusajs/framework/utils' or its corresponding type declarations.
Tasks: 0 successful, 79 total
Time: 15.31s
```

Every package that depends on another failed, because its dependency had not been built.
Turbo had run all 79 build tasks **in parallel**.

**Turbo 1.13.4 cannot parse pnpm's `lockfileVersion: '9.0'`.** It does not error or warn —
it silently constructs an *empty* dependency graph and ignores `dependsOn: ["^build"]`
entirely:

```bash
turbo run build --dry-run=json --filter=@medusajs/analytics-local | jq '.tasks[0].dependencies'
# turbo 1.13.4  ->  []
# turbo 2.11.2  ->  ["@medusajs/framework#build"]
```

The failure presents as a *TypeScript* error in an unrelated package, which is why it is
worth writing down: nothing in the output points at turbo.

## Decision

Upgrade to turbo 2 (2.11.2) as a **prerequisite** of the pnpm migration, not a follow-up.
Convert `turbo.json` from `pipeline` to `tasks` at the same time.

## Consequences

- `outputs` were tightened from upstream's very broad `*/**` (which caches every
  top-level subdirectory of every package) to `["dist/**", ".medusa/**"]`. A package that
  emits elsewhere needs its own override.
- Phase 0 no longer reproduces upstream's build tooling exactly. This is an accepted,
  documented deviation: the alternative is no dependency ordering at all.
- Any future upstream change to `turbo.json` will conflict, since upstream remains on v1
  syntax. Recorded in [`../UNPORTED.md`](../UNPORTED.md).

## Detection

If a build ever fails with `TS2307: Cannot find module '@medusajs/...'` in a package whose
dependency exists and compiles fine on its own, check turbo's graph with the `--dry-run`
command above **before** investigating TypeScript or module resolution.
