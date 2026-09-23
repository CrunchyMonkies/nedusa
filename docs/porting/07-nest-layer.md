# The Nest layer

Everything under `packages/nest/*` and `apps/*` is **new code**, not vendored from
upstream. It is the only part of the repo that never merges with an upstream release, so
it is also the only part free to be idiomatic.

## It is ESM, and that is not optional

NestJS 12 is ESM-only ([ADR-012](adr/ADR-012-nestjs-12-esm.md)). Any package importing
`@nestjs/common` must therefore be ESM too. That is the whole Nest layer.

Practical consequences, each of which has already bitten:

| Rule | Why |
| --- | --- |
| `"type": "module"` in every `packages/nest/*` manifest | it imports `@nestjs/common` |
| `module`/`moduleResolution`: `Node16` in its tsconfig | inherits the base config otherwise, which is CommonJS |
| Relative imports carry an explicit `.js` extension | the specifier is emitted verbatim and resolved by Node at runtime |
| No `__dirname`, no `require` | use `import.meta.url` + `fileURLToPath` |
| A CommonJS fixture needs a sibling `package.json` with `"type": "commonjs"` | inside an ESM package Node reads `.js` as ESM, and `require` is undefined |

That last one is worth dwelling on: a real Medusa project's `medusa-config.js` is
CommonJS, and it works because the project is its own package. A CommonJS *fixture* inside
an ESM package is not, and fails with `require is not defined in ES module scope`.

Importing **from** Medusa is fine — ESM imports CommonJS, and named imports survive the
barrels (8/8 packages probed, 1,409 named exports from `core-flows`). The direction that
does not work is CommonJS `require()`-ing the Nest layer; use `await import()`.

## Tests use `node:test`, not jest

The repo runs jest via `@swc/jest` across 71 CommonJS projects. Rather than bend that
setup around ESM, the Nest layer uses Node's built-in test runner, which runs ESM natively
with no transform:

```jsonc
"scripts": { "test": "node --test \"dist/__tests__/**/*.test.js\"" }
```

It runs against **built output**, so `pnpm build` must precede `pnpm test` — which turbo's
`dependsOn: ["^build"]` already arranges for dependents, and the package's own build is
part of the same task graph.

Non-TypeScript fixtures are staged into `dist` by `scripts/stage-fixtures.mjs`, because
tsc only emits TypeScript output.

## Bridging to the legacy container

Upstream resolves everything from an awilix container by string key. While that container
still exists, each Nest provider that replaces one registers under **both** tokens:

```ts
{ provide: NEDUSA_CONFIG, useFactory: ... }
{ provide: LEGACY_CONFIG_KEY, useExisting: NEDUSA_CONFIG }   // "configModule"
```

`useExisting` rather than a second factory, so `ContainerCompat.resolve("configModule")`
and `@Inject(NEDUSA_CONFIG)` return the *same instance* rather than loading twice. The
legacy aliases are removed in the de-shimming phase.

## Modules built so far

| Package | Status |
| --- | --- |
| `apps/server` | boots, serves `GET /health` as `200 "OK"` |
| `@nedusa/nest-config` | loads and normalises `medusa-config`, exposed under both tokens |
| `@nedusa/nest-database` | not started |
| `@nedusa/nest-modules-runtime` | not started |
| `@nedusa/nest-temporal` | not started (Phase 2) |

### A caveat on `@nedusa/nest-config`

Importing `@nedusa/framework/config` has a **module-scope side effect**: its `loader.ts`
registers the config into the process-global awilix container on import. That is Hazard 3
(process-global statics), it is why this module cannot yet be instantiated twice in one
process, and it is addressed later in Phase 1. Harmless today because the legacy container
still exists.
