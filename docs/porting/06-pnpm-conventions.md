# pnpm conventions

nedusa uses **pnpm workspaces**; upstream uses **Yarn Berry 3.2.1** with the
`node-modules` linker. Every item below is a real breakage hit during the v2.21.1 port,
not a precaution. Expect to re-apply the same reasoning on each upstream import.

All settings live in [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml). There is no
`.npmrc` — one source of truth.

---

## 1. `linkWorkspacePackages: true` — the one that silently ruins everything

Upstream pins internal dependencies as **exact versions** (`"@medusajs/utils": "2.21.1"`),
not `workspace:*`. There are 285 such pins. Yarn resolves them to the local workspace
because the version matches.

**pnpm ≥10 defaults `linkWorkspacePackages` to `false`.** Without this setting, all 285
resolve from the **npm registry** — the fork builds against published upstream Medusa,
your changes have no effect, and nothing errors.

Guard it in CI:

```bash
grep -cE "^  '?@medusajs/" pnpm-lock.yaml     # MUST be 0
```

A non-zero count means a workspace package is being fetched from the registry.

---

## 2. `nodeLinker: hoisted` — deliberate, temporary

Upstream's `.yarnrc.yml` sets `nodeLinker: node-modules` (flat, hoisted), and a lot of
tooling silently depends on that layout. `hoisted` keeps nedusa behaviourally identical
to upstream so that porting breakage is attributable to the port, not the linker.

Moving to pnpm's strict isolated linker is a **separate, later change**. It will force
every implicit dependency to be declared — worth doing, not worth bundling.

---

## 3. Every workspace is a root devDependency

Yarn links *all* workspace packages into the root `node_modules`, so a package can import
a sibling it never declared and Node's upward resolution finds it. Upstream leans on this
hard: **24 of 85 packages import a workspace sibling absent from their `package.json`**,
most commonly `@medusajs/types` (13 packages).

Those declarations cannot simply be added. Several are **cyclic** — `@medusajs/types`
imports `@medusajs/framework`, which imports `@medusajs/types` — and are type-only, so
declaring them would inject real cycles into turbo's build graph for no benefit.

`hoistWorkspacePackages: true` does **not** solve this: it hoists into a hidden directory,
not the root.

The fix is to list every workspace package in the root `package.json` `devDependencies`
as `workspace:*`. That reproduces yarn's flat linking exactly. It is why the root manifest
has ~81 `@medusajs/*` devDependencies that nothing at the root actually imports.

> Regenerate after adding or removing a workspace:
> `node tools/codemods/link-workspaces-at-root`

---

## 4. `allowBuilds`, not `onlyBuiltDependencies`

pnpm blocks dependency lifecycle scripts by default since v10.

**Version gotcha:** pnpm 10 spelled this `onlyBuiltDependencies` (a **list**). pnpm 11
renamed it to `allowBuilds` (a **map** of name → bool) and *silently drops the old key* —
so a v10-era allowlist looks right, has no effect, and every install still reports
`ERR_PNPM_IGNORED_BUILDS`.

Let pnpm write it: `pnpm approve-builds --all`.

None of the current entries are load-bearing — `esbuild` and `@swc/core` ship prebuilt
native bindings as optional dependencies and were verified working with their scripts
blocked. They are approved to keep installs quiet and deterministic.

---

## 5. Patches: bare keys, never version-keyed

Upstream carries two `patch:` resolutions. In pnpm these become `patchedDependencies`,
with the patch bodies (plain git diffs) copied across byte-for-byte into `patches/`.

**Key them by bare package name, not by version.** Exact versions were tried first and
broke immediately: upstream's `yarn.lock` pinned `@changesets/assemble-release-plan` at
`6.0.9`, but a fresh resolution of `@changesets/cli@^2.26.0` lands on `2.31.1`, which
requires `^6.0.10` — so the patch went unused and pnpm aborted the install with
`ERR_PNPM_UNUSED_PATCH`.

Since the fork re-resolves from scratch on every upstream import, version-keyed patches
break on any transitive patch-level bump. A bare key applies to whatever resolves, and if
the patch ever stops applying, pnpm fails loudly — the behaviour we want.

Upstream's third patch, `.yarn/patches/changesets.patch`, is a dead predecessor referenced
by neither `package.json` nor `yarn.lock`. Not ported.

---

## 6. Overrides: `a>b`, not `a/b`

Yarn's nested-path resolution keys use `/`; pnpm uses `>`.

```yaml
# yarn:  "@redocly/cli/react": "^17.0.1"
overrides:
  "@redocly/cli>react": "^17.0.1"
```

Left in yarn syntax these are **silent no-ops** — no error, no effect.

---

## 7. Turbo must be v2 — not optional

Turbo **1.13.4 cannot parse pnpm's v9 lockfile**. It does not fail; it silently builds an
*empty* dependency graph, runs all 79 build tasks in parallel, and every package that
depends on another fails with `TS2307: Cannot find module '@medusajs/framework/...'`
because its dependency has not been built yet.

Diagnose with:

```bash
turbo run build --dry-run=json --filter=<pkg> | jq '.tasks[0].dependencies'
# [] on turbo 1.x  ->  no graph
```

Turbo 2 also renames `pipeline` → `tasks`. `outputs` were tightened from upstream's very
broad `*/**` to `dist/**` and `.medusa/**`; a package emitting elsewhere needs its own
override.

---

## 8. Scripts: what the `yarn-to-pnpm` codemod does

Run `node tools/codemods/yarn-to-pnpm [--check]`. It is idempotent.

| Upstream | nedusa | Why |
| --- | --- | --- |
| `yarn run -T <bin>` | `<bin>` | `-T` means "run from the workspace root". pnpm needs no flag: like npm, it prepends every **ancestor** `node_modules/.bin` to `PATH`, so a root devDependency's binary already resolves inside any package. Verified empirically before relying on it. |
| `../../node_modules/.bin/jest` | `jest` | Same resolution, without the brittle relative depth. |
| `yarn workspace <pkg> <script>` | `pnpm --filter <pkg> run <script>` | |
| `yarn ./path/to/pkg run <script>` | `pnpm --filter ./path/to/pkg run <script>` | yarn's workspace-by-path shorthand has no pnpm equivalent. |
| `yarn <script>` / `npm run <script>` | `pnpm run <script>` | |
| `yarn install --no-immutable` | `pnpm install --no-frozen-lockfile` | |

The same PATH-ancestor behaviour is why the 8 packages that call **undeclared** binaries
(`rollup`, `cross-env`, `nodemon`, `eslint`, `prettier`, `ts-node`) keep working: all are
root devDependencies. Under the strict linker they will need declaring.

---

## 9. `prepare` scripts are relocated to `build:prod`

Four packages had `prepare: cross-env NODE_ENV=production yarn run build`. `prepare` runs
during `pnpm install` — **before turbo has built any workspace dependency** — so the build
is guaranteed to fail, and it relies on an undeclared `cross-env` besides.

It is redundant for publishing: CI runs install → `turbo build` → `changeset publish`, so
artifacts already exist by publish time. The command is preserved under a non-lifecycle
name rather than deleted.

`@medusajs/telemetry`'s `postinstall` targets consumers of the *published* package; in the
monorepo it runs before the package has ever been built. It is now guarded on the file
existing, instead of throwing a stack trace on every install.

---

## 10. `yarn workspaces list --json` is NDJSON; pnpm's is an array

`scripts/run-workspace-unit-tests-in-chunks.sh` consumed yarn's newline-delimited JSON via
`jq -j '[inputs | .name]'`. `pnpm ls -r --depth -1 --json` emits a single JSON **array**,
so the `inputs` idiom no longer applies and the three-stage jq chain collapses to one:

```bash
pnpm ls -r --depth -1 --json \
  | jq -cM '[.[] | select(.name != null) | .name] | [_nwise((length / 2) | ceil)]'
```

---

## 11. Known-carried-over: the workspace dependency cycle

`pnpm install` warns:

```
There are cyclic workspace dependencies: packages/medusa, packages/modules/analytics,
packages/medusa-test-utils
```

This is upstream's cycle, not one the port introduced. Yarn tolerated it silently. It is
recorded here so it is not rediscovered as a regression.

---

## Still on yarn: `www/`

`www/` is a **separate nested workspace root** with its own lockfile and `link:` deps
crossing the boundary. It has not been migrated. Docs workflows under `.github/workflows/`
that operate on `www/` still invoke yarn deliberately; workflows that install the root
monorepo have been ported. Folding `www/` into the single pnpm workspace is tracked as an
open item.

---

## 12. Transitive version drift — the residual risk

There is no lockfile conversion. `yarn.lock` and `pnpm-lock.yaml` are different formats,
so the fork **re-resolves every dependency from scratch**. Direct dependencies are pinned
by their ranges and land where expected; *transitive* dependencies drift to whatever
currently satisfies the range.

This is the largest remaining source of "worked upstream, fails here", and it is not
visible in any diff.

Two instances found on the v2.21.1 import:

### How wide is it?

Comparing the two installed trees directly: of **1,680 packages present in both**,
**308 resolved to different versions**. That is the scale of the problem — not a handful
of stragglers.

```bash
# diff every resolved version between the two checkouts
node -e '...' # see git history for the full script
```

Most of that drift is harmless (AWS SDK patch bumps and the like). Three instances
mattered, and each cost real time to find:

| Package | Upstream | Fresh pnpm | Symptom | Action |
| --- | --- | --- | --- | --- |
| `@changesets/assemble-release-plan` | 6.0.9 | 6.0.10 | `ERR_PNPM_UNUSED_PATCH`, install aborts | patch key changed to a bare name (§5) |
| `msw` (and `rettime` beneath it) | 2.12.4 / 0.7.0 | 2.15.0 / 0.11.11 | `@medusajs/js-sdk` suite dies on an ESM parse error | **pinned `msw` to 2.12.4** |
| `@ariakit/react` | 0.4.20 | 0.4.40 | dashboard combobox spec fails 3 of 4: `user.type(input,"App")` lands as `"Ap"` | **pinned to 0.4.20** |

### How to diagnose one

The Ariakit case is the instructive one, because the symptom pointed everywhere except
the cause. A dropped keystroke in a typing test implicates the typing library, the DOM
implementation, or the test runner — so `@testing-library/user-event`, `jsdom` and
`vitest` were each pinned back to upstream's version in turn, and **none of them fixed
it**. Medusa's `Combobox` is built on Ariakit; that was the culprit.

The method that worked, and the one to repeat:

1. **Get a baseline first.** Install upstream with yarn and run the *same single spec*
   there. Upstream passed 4/4, which proved the failure was introduced rather than
   inherited. Without that, you are guessing about your own regression.
2. **Diff the whole resolved tree**, not just the obvious suspects.
3. **Pin candidates one at a time** and re-run the single failing spec.
4. **Remove the pins that did not help.** A pin that is not carrying its weight silently
   blocks future upgrades. Only `msw` and `@ariakit/react` remain pinned; `user-event`,
   `jsdom` and `vitest` were reverted once disproven.

Run baselines **sequentially** — see §13. The first attempt at this comparison ran an
upstream build and a vitest baseline alongside the nedusa suite and OOM-killed the VM.

The changesets drift broke the install outright (`ERR_PNPM_UNUSED_PATCH`, §5). The msw
drift surfaces as a Jest ESM parse error, because `define_jest_config.js` allows only
`until-async` and `msw` through `transformIgnorePatterns` and `rettime` is pure ESM:

```
Jest encountered an unexpected token
/node_modules/rettime/build/index.mjs:1
import { LensList } from "./lens-list.mjs";
```

**When a test fails in a way that looks unrelated to the port, check the resolved version
against upstream's `yarn.lock` before investigating anything else:**

```bash
node -e "console.log(require('./node_modules/<pkg>/package.json').version)"
grep -A2 'resolution: "<pkg>@npm:' ../medusa/yarn.lock
```

Options when drift bites, in order of preference:

1. **Pin to upstream's version** in `overrides`. Restores parity, costs nothing, and the
   next upstream release will move it deliberately rather than accidentally.
2. **Adapt the config** (e.g. widen `transformIgnorePatterns`). Correct when the newer
   version is genuinely wanted.
3. **Leave it** — but record it, so the next person does not re-diagnose it.

Do not reach for #3 silently. Drift that is not written down is indistinguishable from a
bug the port introduced.

---

## 13. Concurrency is capped on purpose — do not raise it blindly

This monorepo fans out multiplicatively. Turbo runs N packages at once, and **each**
package's jest then spawns `cpus-1` workers. On a 32-core machine across 85 workspaces
that reaches roughly a thousand node processes.

On 2026-09-23 a `turbo run test` reached **156 concurrent jest workers** while an upstream
`yarn build` and a `vitest` baseline ran alongside it, and the dev WSL VM was OOM-killed
outright — not a single process, the whole VM, because that box runs `memory=32G` with
**`swap=0`** and so has no headroom to absorb a burst.

Caps now applied, all overridable:

| Where | Cap |
| --- | --- |
| `define_jest_config.js` (covers 71 packages) | `maxWorkers: process.env.JEST_MAX_WORKERS \|\| 4` |
| `packages/medusa/jest.config.js`, `packages/cli/oas/medusa-oas-cli/jest.config.js`, `integration-tests/jest.config.js` (bypass the factory) | same |
| `packages/admin/dashboard/vite.config.mts`, `design-system/{ui,icons}`, `admin/admin-vite-plugin` | `poolOptions.threads.maxThreads: 4` |
| root `build` script | `turbo --concurrency=12` |
| root `test` script | `turbo --concurrency=4` |

Rules of thumb for this box:

- Budget **~16 concurrent node processes** total. `turbo --concurrency=4` × `maxWorkers: 4`
  is exactly that.
- **Never run two heavy builds or suites at once across the `nedusa` and `medusa`
  checkouts.** Comparing against an upstream baseline is a *sequential* activity.
- Watch it while it runs: `pgrep -c -f jest`. If that number climbs past ~20 on this
  hardware, stop and re-check the caps.

CI runners are usually smaller than this machine and have swap, so raising
`JEST_MAX_WORKERS` there is reasonable. Raising it locally is not.
