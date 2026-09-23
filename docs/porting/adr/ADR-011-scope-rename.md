# ADR-011: Rename the npm scope to `@nedusa/*`

**Status:** accepted · **Date:** 2026-09-23 · **Phase:** 0

## Context

The fork vendors upstream's 82 packages, all published under `@medusajs/*`. It must keep
absorbing upstream releases indefinitely via `git merge` from a vendor branch (ADR-010).

## Decision

Rename the scope to `@nedusa/*` across manifests, source, configs and CI, applied by
`tools/codemods/scope-rename` rather than by hand. 11,357 occurrences across 4,582 files.

Three deliberate limits:

- **`www/` is excluded** for now. It is a separate workspace still on yarn, and most of
  its `@medusajs` references are prose in ~718 mdx files. It is renamed in Phase 5, when
  `www/` itself is migrated.
- **`docs/porting/` and `CHANGELOG.md` are excluded.** They discuss upstream by name;
  renaming them would make them wrong.
- **`core-flows` keeps its name** (as `@nedusa/core-flows`). Renaming it to `workflows`
  was considered and dropped: that is a semantic rename stacked on top of a scope rename,
  and the package is restructured for Temporal in Phase 2 regardless. One change at a time.

## Rationale

The scope is what a reader sees at every import site. Leaving it as `@medusajs/*` in a
fork that no longer behaves like Medusa — different DI, different router, different
workflow engine — is actively misleading, and it risks a published package colliding with
upstream's.

## Consequences, stated honestly

**This makes upstream merges more expensive, and that cost is permanent.**

It is bounded, though, and worth being precise about rather than alarmist: git merges
per *hunk*, not per file. A scope rename on line 3 and an upstream change on line 50 of
the same file do **not** conflict. Conflicts arise only where upstream also modifies a
line that names a package — typically when imports are added or removed. That is a real
and recurring minority of hunks, not "every file".

Mitigations:

- The codemod is **idempotent and re-runnable**, so the rename is re-applied to newly
  imported upstream files automatically rather than by hand.
- It exports `normalise()`, which maps `@nedusa/` back to `@medusajs/`. The upstream-sync
  differ runs both sides through it, so the rename never shows up as a *reported* change.
  Note this makes diffs readable; it does not make git's merge conflict-free.

**Not renamed at runtime:** package names also appear as module-resolution strings, not
just import specifiers — `packages/core/utils/src/modules-sdk/definition.ts` alone has 36
(`"@medusajs/medusa/analytics"` and friends). This is why the codemod is a textual rename
across source rather than an AST import rewrite: missing those would break module loading
at runtime, not at compile time.

## Alternative rejected

**Keep `@medusajs/*`.** Cheaper merges forever, and the strongest argument against
renaming. Rejected because the fork must never publish under upstream's scope, and
because `linkWorkspacePackages` plus exact-version pins made "is this ours or upstream's?"
a live source of confusion during Phase 0 — the exact failure mode a distinct scope
removes.
