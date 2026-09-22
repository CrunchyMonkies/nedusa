#!/usr/bin/env node
/**
 * Remove NESTED workspace symlinks, leaving only the ones at the workspace root.
 *
 * WHY THIS EXISTS
 * ---------------
 * Yarn's node-modules linker hoists every workspace package to the root node_modules, so
 * each one is visible at exactly ONE path. pnpm instead symlinks a workspace package into
 * the node_modules of every package that declares it, so @medusajs/types (for example) is
 * reachable at 17 different paths.
 *
 * All 17 resolve to the same realpath, so this is harmless at runtime -- but it breaks
 * TypeScript's DECLARATION EMIT. When tsc has to name a type it reached transitively, it
 * picks one of the nested paths and emits:
 *
 *   error TS2742: The inferred type of 'getLinkRepository' cannot be named without a
 *   reference to '../../../../core/modules-sdk/node_modules/@medusajs/types/dist/dal/utils'.
 *   This is likely not portable. A type annotation is necessary.
 *
 * Verified by experiment: removing the nested links and leaving only the root one makes
 * the failing package compile, with no other change.
 *
 * The alternatives were worse:
 *   - Declaring the transitive package in the failing package: does NOT fix it; tsc still
 *     reaches the type through the nested chain.
 *   - preserveSymlinks: true: makes it worse -- the emitted path grows into
 *     '@medusajs/framework/node_modules/@medusajs/modules-sdk/node_modules/@medusajs/types/...'
 *     because symlink identities stop being deduplicated by realpath.
 *   - Adding explicit type annotations upstream: edits vendored source, which is the one
 *     thing the fork must not accumulate (see docs/porting/01-upstream-sync.md).
 *
 * SAFETY
 *   - Only symlinks pointing INSIDE this repo (i.e. workspace packages) are removed.
 *     Third-party packages are never touched.
 *   - Every workspace package is linked at the root (see
 *     tools/codemods/link-workspaces-at-root), so Node's upward resolution still finds
 *     them -- exactly as it did under yarn.
 *   - Safe because all workspace packages share one version. If nedusa ever needs two
 *     versions of the same workspace package simultaneously, this must be revisited.
 *
 * Runs from the root `postinstall`, because pnpm recreates the links on every install.
 */
const fs = require("fs")
const path = require("path")

const repoRoot = path.resolve(__dirname, "..", "..")
const rootModules = path.join(repoRoot, "node_modules")

function* workspaceDirs() {
  const stack = [repoRoot]
  while (stack.length) {
    const dir = stack.pop()
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entries) {
      if (!e.isDirectory() && !e.isSymbolicLink()) continue
      if (e.name === ".git" || e.name === "dist" || e.name === ".medusa") continue
      const full = path.join(dir, e.name)
      if (e.name === "node_modules") {
        if (full !== rootModules) yield full
        continue // never descend into a node_modules tree
      }
      if (e.isDirectory()) stack.push(full)
    }
  }
}

let removed = 0
const scopes = ["@medusajs", "@nedusa"]

for (const nm of workspaceDirs()) {
  for (const scope of scopes) {
    const scopeDir = path.join(nm, scope)
    let links
    try {
      links = fs.readdirSync(scopeDir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const l of links) {
      if (!l.isSymbolicLink()) continue
      const full = path.join(scopeDir, l.name)
      let target
      try {
        target = fs.realpathSync(full)
      } catch {
        continue
      }
      // only unlink workspace packages -- targets inside the repo but outside node_modules
      if (!target.startsWith(repoRoot + path.sep)) continue
      if (target.includes(`${path.sep}node_modules${path.sep}`)) continue
      fs.unlinkSync(full)
      removed++
    }
    try {
      if (fs.readdirSync(scopeDir).length === 0) fs.rmdirSync(scopeDir)
    } catch {}
  }
}

console.log(`flatten-workspace-links: removed ${removed} nested workspace symlinks`)
