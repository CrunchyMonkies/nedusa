# ADR-010: Import upstream by merging a vendor branch, never by copying

**Status:** accepted · **Date:** 2026-09-23 · **Phase:** 0

## Context

nedusa must absorb an upstream release roughly every 2–3 weeks, indefinitely, while
diverging substantially in two layers (HTTP and workflows). Upstream is ~820k LOC across
85 workspaces; over a 12–18 month port the fork will absorb 15–20 releases *during
construction alone*.

How upstream source physically arrives in the repository determines whether that is
sustainable or not.

## Decision

Two branches:

```
vendor/upstream   pure upstream history. Nothing nedusa-specific is ever committed here.
main              the fork. Receives upstream via git MERGE.
```

Importing a release is `git merge vendor/upstream` on `main` — never a file copy, rsync,
or patch application.

The vendor baseline is recorded in [`.upstream-version`](../../../.upstream-version) and
the initial import is tagged `upstream-v2.21.1`.

## Rationale

Git can only compute a three-way merge if it can find a **common ancestor**. Because
`vendor/upstream` shares real history with upstream, every merge has one, so git resolves
the overwhelming majority of upstream changes automatically and presents genuine conflicts
only where nedusa has actually diverged.

If upstream source is instead copied over the working tree, git sees unrelated content
with no shared ancestry. Every changed file becomes a whole-file conflict, and the porter
is left diffing by eye. That is affordable for one release and unaffordable by the second.

Keeping `vendor/upstream` **pure** is what preserves the property. The moment a
nedusa-specific commit lands on it, the ancestry stops describing upstream and the merges
degrade.

## Consequences

- `vendor/upstream` is advanced with `git merge --ff-only <tag>`. A non-fast-forward there
  means someone has committed to it, which must be reverted rather than merged.
- Deleted subsystems (`orchestration`, `workflows-sdk/composer`, `framework/src/http`)
  produce recurring conflicts. These are *expected* and listed in
  [`../UNPORTED.md`](../UNPORTED.md); they are triaged by hand every release.
- The scope rename `@medusajs/*` → `@nedusa/*` makes every upstream diff noisier forever.
  This is mitigated in tooling, not by avoiding the rename: `sync:report` normalises the
  scope on both sides before diffing, so a rename never shows up as a change.
- Upstream's full history (24,117 files at v2.21.1) lives in the repository. That is a
  one-time clone cost and worth it.

## Corollary: never hand-edit vendored source

Every mechanical change belongs in `tools/codemods/`. A hand edit to vendored code is
re-applied on every subsequent release, forever, by someone who will not remember why it
was made. If a codemod cannot express the change, that is a signal to extend the codemod —
or to move the logic into the Nest layer, where upstream never treads.
