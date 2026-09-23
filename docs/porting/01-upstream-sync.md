# Porting an upstream release into nedusa

Upstream ships roughly **every 2–3 weeks**. This is the runbook for carrying a release
across. It is written to be followed literally.

The fork's survival depends on one principle: **transforms, not edits.** Every mechanical
change to upstream source lives in `tools/codemods/` and is re-run against the new tag.
A hand edit to vendored code is a divergence you will re-apply forever — if you find
yourself making one, that is a signal the codemod needs extending instead.

---

## Tooling status

This runbook describes the process end to end. Some of the tooling it calls arrives with
the phase that needs it — do not assume a command exists because it is written here.

| Command | Status |
| --- | --- |
| `node tools/codemods/yarn-to-pnpm` | **available** |
| `node tools/codemods/link-workspaces-at-root` | **available** |
| `pnpm install` / `pnpm build` / `pnpm test` | **available** |
| `pnpm sync:report` / `pnpm sync:apply` | planned — needs the route/workflow codemods |
| `pnpm parity:check` | planned — Phase 3 (API layer) |
| `pnpm oas:diff` | planned — Phase 3 |
| `pnpm test:replay` | planned — Phase 2 (Temporal) |
| `pnpm test:integration:http` / `:modules` | **available**, but green only once the port reaches the relevant phase |

Until `sync:report` exists, do step 3 by reading `git diff --stat` against the areas in
the classification table by hand.

---

## 0. Repository model

```
vendor/upstream   pure upstream history. NOTHING nedusa-specific is ever committed here.
main              the fork. Receives vendor/upstream via MERGE, never copy-paste.
```

`vendor/upstream` exists so git can compute a real three-way merge. If you import
upstream by copying files over the tree, git sees unrelated content, every conflict is a
whole-file conflict, and the port becomes unaffordable within two releases.

The current baseline is in [`.upstream-version`](../../.upstream-version).

---

## 1. Fetch and read the delta

```bash
git fetch upstream --tags
export FROM=$(cat .upstream-version)        # e.g. v2.21.1
export TO=v2.22.0

# What actually changed, by area. Read this before touching anything.
git log --oneline $FROM..$TO -- packages/medusa/src/api          # routes
git log --oneline $FROM..$TO -- packages/core/core-flows         # workflows
git log --oneline $FROM..$TO -- packages/modules                 # domain
git log --oneline $FROM..$TO -- packages/core/framework/src/http # the layer we replaced
```

Also read upstream's `CHANGELOG.md` and `.changeset/` for the release. Breaking changes
are announced there and are usually the expensive part.

**Red flag:** commits under `packages/core/framework/src/http`,
`packages/core/orchestration`, or `packages/core/workflows-sdk` touch code nedusa has
*deleted or replaced*. They do not merge; they need a human decision about whether the
behaviour change matters. Budget time whenever these appear.

---

## 2. Advance the vendor branch

```bash
git checkout vendor/upstream
git merge --ff-only $TO        # vendor/upstream must stay pure upstream
git checkout main
git merge vendor/upstream      # expect conflicts; resolve them in step 3
```

---

## 3. Classify and resolve

```bash
pnpm sync:report               # classifies every changed file
```

| Class | Typical content | How to handle |
| --- | --- | --- |
| **Domain** | `packages/modules/**` models, migrations, services, links, `packages/core/utils` | Usually merges clean. These were re-wrapped, not rewritten. |
| **Routes** | `api/**/route.ts`, `middlewares.ts`, `validators.ts`, `query-config.ts` | Re-run `route-to-controller` + `middlewares-to-decorators` on the changed files only. |
| **Workflows** | `core-flows/**` | Re-run `workflow-to-temporal` + `step-to-activity`, then hand-check determinism and idempotency on anything new. |
| **Replaced framework** | `framework/src/http`, `orchestration`, `workflows-sdk` | No automatic path. Triage by hand. This is where a release gets expensive. |
| **Build/workspace** | `package.json` scripts, CI, turbo config | Re-run `yarn-to-pnpm`; see [06-pnpm-conventions.md](06-pnpm-conventions.md). |

Scope renaming is handled by the differ, not by you: `sync:report` normalises
`@medusajs/*` ↔ `@nedusa/*` before diffing, so the rename never shows up as a change.

---

## 4. Apply the transforms

```bash
pnpm sync:apply                # runs every codemod over the changed set
pnpm sync:apply --check        # dry run: report only, non-zero exit if anything differs
```

Every codemod is **idempotent**. Re-running on already-converted files is a no-op, so it
is always safe to run the full set rather than reasoning about which apply.

---

## 5. Verify, in this order

Stop at the first failure — later gates assume earlier ones hold.

```bash
# 1. workspace is sane, and nothing resolves upstream from the registry
pnpm install --frozen-lockfile
grep -cE "^  '?@nedusa/" pnpm-lock.yaml      # MUST be 0

# 2. everything compiles
pnpm build

# 3. route table is unchanged vs upstream  (endpoints added/removed/renamed)
pnpm parity:check

# 4. response shapes are unchanged
pnpm oas:diff

# 5. unit tests
pnpm test

# 6. workflow determinism -- replay the recorded history corpus
pnpm test:replay

# 7. the conformance harness: upstream's own integration suite
pnpm test:integration:http
pnpm test:integration:modules
```

Gates 3, 4 and 6 are the ones that catch what review will not:

- **`parity:check`** compares nedusa's resolved Nest route table against upstream's,
  computed by running upstream's own `RoutesLoader` and `RoutesSorter` against the vendor
  checkout. Route *precedence* drift is silent and this is the only thing that sees it.
- **`oas:diff`** normalises both specs (dropping descriptions, examples, key order) and
  compares paths × methods × parameters × response codes.
- **`test:replay`** runs `Worker.runReplayHistory()` over the committed history corpus.
  A non-deterministic workflow change fails *only* on replay — in production, long after
  deploy. Never skip this because "the tests pass".

---

## 6. Record and tag

```bash
echo "$TO" > .upstream-version
git tag "nedusa-$TO"
```

Anything you consciously did **not** port goes in
[`UNPORTED.md`](UNPORTED.md) with the upstream commit SHA and the reason. An
unported commit that is written down is a decision; one that is not is a bug waiting to
be rediscovered.

Write a release note in [`releases/`](releases/) using the template: what changed, which
codemods needed extending, what broke, how long it took. Three of these and you will be
able to predict the cost of the next one.

---

## What a release actually costs

Measured with `pnpm sync:report` over one real upstream cycle, **v2.20.0 → v2.21.1**
(2,005 changed files):

| Bucket | Files | What it means |
| --- | --- | --- |
| docs site (`www/`) | 1,481 | free — not ported |
| domain (`packages/modules`, `packages/core`) | 180 | usually merges clean |
| build / workspace / CI | 95 | re-run `yarn-to-pnpm` |
| other | 117 | mostly changelogs |
| routes (`packages/medusa/src/api`) | 51 | re-run route + middleware codemods |
| tests | 33 | carried across |
| **workflows (`core-flows`)** | **21** | codemod, then check determinism by hand |
| **REPLACED — triage by hand** | **27** | no automatic path |

**Three quarters of a release is documentation the fork does not port.** The genuinely
expensive surface is the bottom two rows: ~48 files touching code nedusa has replaced or
must re-verify. That is the number to plan against — it says a release port is days of
work once the codemods exist, not weeks.

The 27 "REPLACED" files in this sample are all under `framework/src/http` — upstream was
actively changing the router, `types.ts`, `get-query-config.ts` and the field-filtering
middleware in that cycle. That is the layer nedusa rewrites, so every one of them needs a
human decision about whether the behaviour change matters. Expect this bucket to stay
non-empty; it is the standing tax of the fork.

Re-run `pnpm sync:report <from> <to>` at the start of every port and record the numbers in
the release report. Three of those and the estimate stops being a guess.

## Keeping the cost down

The per-release cost is dominated by how much hand-written code sits between upstream's
source and nedusa's. Things that keep it low, in order of impact:

1. **Never hand-edit vendored source.** Extend the codemod.
2. **Keep the wire contract frozen.** It is what makes gates 3, 4 and 7 meaningful.
3. **Do not refactor vendored domain code.** Every cosmetic improvement is a permanent
   merge conflict. Improve it in the Nest layer instead, where upstream never treads.
4. **Port promptly.** Two releases behind is more than twice the work of one, because
   conflicts compound.
