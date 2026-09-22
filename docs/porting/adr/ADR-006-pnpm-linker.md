# ADR-006: Start on pnpm's hoisted linker, not the isolated one

**Status:** accepted · **Date:** 2026-09-23 · **Phase:** 0

## Context

Upstream runs Yarn Berry 3.2.1 with `nodeLinker: node-modules` — a flat, fully hoisted
`node_modules`. A lot of upstream tooling depends on that layout without saying so:

- 348 script invocations use `yarn run -T <bin>` ("run from the workspace root").
- 136 more call binaries by relative path (`../../node_modules/.bin/jest`).
- 8 packages call binaries (`rollup`, `cross-env`, `nodemon`, `eslint`, `prettier`,
  `ts-node`) that they never declare, relying on root hoisting.
- **24 of 85 packages import a workspace sibling absent from their `package.json`**, most
  commonly `@medusajs/types` (13 packages).
- `packages/core/utils/src/common/define-config.ts` resolves plugin modules by bare
  specifier and carries an explicit comment about hoisting hazards.

pnpm's default isolated linker exposes every one of these as a hard failure.

## Decision

Use `nodeLinker: hoisted` for the duration of the port. Tightening to the isolated linker
is a **separate change**, scheduled for the de-shimming phase.

## Rationale

Phase 0's entire purpose is to get upstream source building under pnpm **unchanged**, so
that any later breakage is attributable to the NestJS/Temporal port rather than to the
package manager. Mixing a package-manager migration with a dependency-hygiene cleanup
across 85 packages would destroy that property: every build failure becomes ambiguous.

The undeclared **workspace** imports also cannot be fixed by simply declaring them.
Several are cyclic — `@medusajs/types` imports `@medusajs/framework`, which imports
`@medusajs/types` — and type-only. Declaring them would inject real cycles into turbo's
build graph in exchange for nothing.

## Consequences

**Accepted:**

- The fork inherits upstream's dependency-hygiene debt rather than paying it down now.
- `hoisted` gives up pnpm's strictness guarantee: a package can import something it does
  not declare and nothing complains. That is precisely the bug class above, now latent.
- Two extra mechanisms are needed to fully reproduce yarn's layout:
  `tools/codemods/link-workspaces-at-root` (every workspace listed at the root) and
  `tools/pnpm/flatten-workspace-links.js` (nested workspace symlinks removed, because they
  break TypeScript declaration emit with `TS2742`).

**Deferred to de-shimming:**

- Declare every implicit dependency, then switch to the isolated linker.
- Delete the two mechanisms above once workspace links no longer need flattening.
- Revisit `packages/deps`, the dependency-pinning indirection package that exists to
  defeat hoisting ambiguity and may be redundant under a strict linker.

## Alternatives rejected

| Option | Why not |
| --- | --- |
| Isolated linker now, declare everything | Forces a 85-package dependency audit *simultaneously* with the framework port. Cannot untangle which change broke what. Also does not resolve the cyclic type-only imports. |
| `shamefully-hoist: true` | Hoists all transitive deps to the root, which is *more* permissive than yarn's layout. It would mask genuine errors that yarn would have caught, making the eventual tightening harder, not easier. |
| Stay on yarn | Explicitly out of scope; pnpm workspaces were a requirement of the port. |
