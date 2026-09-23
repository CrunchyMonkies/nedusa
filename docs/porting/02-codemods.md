# Codemods

Every mechanical change nedusa makes to upstream source is a **transform**, not an edit.
This is the load-bearing decision of the whole fork: upstream ships every 2–3 weeks, and a
hand edit to vendored code is a divergence that must be re-applied forever.

All transforms are **idempotent** — re-running on already-converted source is a no-op, so
it is always safe to run the whole set rather than reasoning about which apply.

```bash
node tools/codemods/<name>            # apply
node tools/codemods/<name> --check    # dry run; non-zero exit if anything would change
```

`--check` is what CI runs, so drift between the source and the transforms fails the build.

---

## Implemented

### `yarn-to-pnpm`

Rewrites yarn-berry-isms in workspace `package.json` scripts. Applied to 360 scripts
across 82 manifests on the v2.21.1 import.

| Upstream | nedusa |
| --- | --- |
| `yarn run -T <bin>` | `<bin>` |
| `../../node_modules/.bin/<bin>` | `<bin>` |
| `yarn workspace <pkg> <script>` | `pnpm --filter <pkg> run <script>` |
| `yarn ./path run <script>` | `pnpm --filter ./path run <script>` |
| `yarn <script>` / `npm run <script>` | `pnpm run <script>` |

Both bare-binary rewrites rely on pnpm prepending every **ancestor** `node_modules/.bin`
to `PATH`, so a root devDependency's binary resolves inside any workspace package. This
was verified empirically against pnpm 11.23.0 before the transform was written, rather
than assumed — see [06-pnpm-conventions.md](06-pnpm-conventions.md) §8.

### `scope-rename`

Renames `@medusajs` → `@nedusa`. Applied to 11,367 occurrences across 4,591 files on the
v2.21.1 import.

It is a **textual** rename, not an AST import rewrite, and the matching rule is narrower
than it first appears:

```js
const SCOPE_RE = /@medusajs(?![.\-\w])/g
```

The negative lookahead is load-bearing. `.` protects email addresses and documentation
domains — `kasper@medusajs.com` appears as the `author` in 7 manifests and must not be
touched — and `-` protects the `@medusajs-bot` account referenced in CI.

Everything *else* following the scope is in play, which matters more than it looks. An
earlier version matched the literal `"@medusajs/"` and silently missed three shapes:

| Missed shape | Where | Consequence |
| --- | --- | --- |
| `"@medusajs"` bare | `eslint-plugin/src/constants.ts` `PLUGIN_NAMESPACE` | every lint rule name stayed on the old scope; caught by tests |
| `/^@medusajs\/[^/]+/` escaped slash in a RegExp | `import-from-framework-not-internal/rule.ts` | **silent** — the rule simply stopped matching the fork's own packages |
| `@medusajs\/ui` in a CI regex | `notify-upcoming-release-items.yml` | **silent** — release filtering breaks |

The two silent cases are the reason this codemod is textual. An import-specifier rewrite
would not have seen any of them, and nothing would have failed.

Package names also appear as **runtime module-resolution strings**:
`packages/core/utils/src/modules-sdk/definition.ts` alone carries 36
(`"@medusajs/medusa/analytics"` and friends). Missing those breaks module loading at
runtime rather than at compile time.

Excluded from the rename: `www/` (a separate workspace, still on yarn, mostly prose —
renamed in Phase 5), `docs/porting/` and `CHANGELOG.md` (they discuss upstream by name).

It also exports `normalise()`, which reverses the rename for the upstream differ. See
[adr/ADR-011-scope-rename.md](adr/ADR-011-scope-rename.md) for the merge cost.

### `link-workspaces-at-root`

Ensures every workspace package is listed in the root `package.json` `devDependencies` as
`workspace:*`, reproducing yarn's flat workspace linking. Needed because 24 of 85 upstream
packages import a workspace sibling they never declared, and those declarations cannot
simply be added — several are cyclic and type-only.

Takes its package list from `pnpm ls -r`, **not** from a `find` over `package.json` files,
because the repo contains a `package.json` that is deliberately not a workspace
(`integration-tests/package.json`, an orphan carrying bogus `^1.20.10` deps).

Re-run after adding or removing a workspace package.

---

## Not a codemod, but in the same spirit

### `tools/pnpm/flatten-workspace-links.js`

Runs from the root `postinstall`. Removes nested workspace symlinks, leaving only the
root ones, because pnpm links a workspace package into every dependent's `node_modules`
while yarn hoists it to exactly one place.

Harmless at runtime — all copies share a realpath — but it breaks TypeScript declaration
emit with `TS2742`, because tsc names a transitively-reached type via one of the nested
paths. Removing the nested links resolved it with no source change. Full reasoning is in
the file header; the alternatives that did **not** work are recorded there too, so they
are not retried.

---

## Planned

These are designed but not yet built. See the phase they belong to.

| Codemod | Transform | Volume | Expected clean |
| --- | --- | --- | --- |
| `route-to-controller` | `api/**/route.ts` verb exports → `@Controller` class beside it, body copied verbatim | 330 files / 487 handlers | ~93% |
| `middlewares-to-decorators` | `defineMiddlewares()` entries → `@ValidateBody` / `@ValidateQuery` / `@Policies`, else `@UseExpressMiddleware` | 435 blocks | ~90% |
| `zod-to-openapi` | `validators.ts` → OAS components `$ref`'d from `@nestjs/swagger` decorators | 77 files | — |
| `step-to-activity` | `createStep` → `@Activity()` method + compensating method; `StepResponse(a,b)` → `[a,b]` | 469 steps | ~95% |
| `workflow-to-temporal` | proxy-taint dataflow analysis → imperative Temporal workflow | 345 workflows | ~55% |
| `module-to-nest-module` | `Module()` → `@Module()`; generated static `providers: []` | 48 modules | — |
| `container-resolve-to-inject` | awilix cradle destructuring → positional `@Inject()` | ~200 constructors | — |
| `express4-to-express5` | route patterns, `req.query` mutation, removed APIs | targeted | — |
| `scope-rename` | `@medusajs/*` → `@nedusa/*`, paired with a normaliser used by `sync:report` | 82 manifests | — |

Two design notes that matter more than they look:

- **`route-to-controller` imports upstream's own `createRoutePath`, `HTTP_METHODS` and
  `RoutesSorter`** rather than reimplementing them. Path derivation is then produced by
  the same code that produces upstream's, which eliminates a whole class of drift.
- **`workflow-to-temporal` must emit `?.` at every hop** of a step-output member access.
  Upstream's composer proxy falls back to `transform({target}, d => d.target?.[prop])`, so
  `cart.data.id` is implicitly null-safe in a Medusa workflow body and is *not* in plain
  TypeScript. Missing this produces runtime `TypeError`s in branches Medusa tolerated.

---

## Writing a new one

1. Put it in `tools/codemods/<name>/index.js`.
2. Support `--check`; exit non-zero when it would change something.
3. Make it idempotent. Test by running it twice — the second run must report zero changes.
4. Prefer importing upstream's own logic over reimplementing it.
5. Document what it does **not** handle. The unhandled tail is what the next person hits,
   and an honest list is worth more than a high coverage number.
