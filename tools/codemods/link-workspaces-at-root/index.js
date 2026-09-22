#!/usr/bin/env node
/**
 * codemod: link-workspaces-at-root
 *
 * Ensures every workspace package appears in the ROOT package.json devDependencies as
 * "workspace:*".
 *
 * WHY: yarn's node-modules linker links all workspace packages into the root
 * node_modules, so a package can import a sibling it never declared and Node's upward
 * resolution finds it. Upstream depends on this -- 24 of 85 packages import a workspace
 * sibling absent from their own package.json, most commonly @medusajs/types.
 *
 * Those declarations cannot just be added to the individual packages: several are cyclic
 * (@medusajs/types <-> @medusajs/framework) and type-only, so declaring them would put
 * real cycles into turbo's build graph. pnpm's `hoistWorkspacePackages` does not help --
 * it hoists into a hidden directory, not the root.
 *
 * Listing them all at the root reproduces yarn's flat linking exactly.
 *
 * Re-run after adding or removing a workspace package.
 * Usage: node tools/codemods/link-workspaces-at-root [--check]
 */
const fs = require("fs")
const { execSync } = require("child_process")

const check = process.argv.includes("--check")

// Source of truth is pnpm itself, NOT a `find` over package.json files -- the repo
// contains at least one package.json that is deliberately not a workspace
// (integration-tests/package.json, an orphan carrying bogus deps).
const workspaces = JSON.parse(
  execSync("pnpm ls -r --depth -1 --json", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
)

const root = JSON.parse(fs.readFileSync("package.json", "utf8"))
const rootName = root.name
const names = workspaces.map((w) => w.name).filter((n) => n && n !== rootName).sort()

const missing = names.filter((n) => !root.devDependencies[n])
const stale = Object.keys(root.devDependencies).filter(
  (n) => root.devDependencies[n].startsWith("workspace:") && !names.includes(n)
)

if (check) {
  if (missing.length) console.log("missing from root devDependencies:\n  " + missing.join("\n  "))
  if (stale.length) console.log("stale workspace links in root devDependencies:\n  " + stale.join("\n  "))
  if (!missing.length && !stale.length) console.log("root workspace links are up to date")
  process.exit(missing.length || stale.length ? 1 : 0)
}

for (const n of missing) root.devDependencies[n] = "workspace:*"
for (const n of stale) delete root.devDependencies[n]
root.devDependencies = Object.fromEntries(
  Object.entries(root.devDependencies).sort(([a], [b]) => a.localeCompare(b))
)
fs.writeFileSync("package.json", JSON.stringify(root, null, 2) + "\n")
console.log(`added ${missing.length}, removed ${stale.length}; ${names.length} workspaces linked at root`)
