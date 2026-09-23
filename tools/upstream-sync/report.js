#!/usr/bin/env node
/**
 * sync:report -- classify what an upstream release changes, for the port runbook.
 *
 * Every changed file is bucketed by how much work it implies for this fork, because the
 * cost of a release is dominated by WHICH areas moved, not how many files did.
 *
 * Scope-rename noise is removed before comparing: both sides are run through
 * tools/codemods/scope-rename's `normalise()`, so "@nedusa/x" vs "@medusajs/x" never
 * registers as a change. Without that, every import line in the fork looks modified.
 *
 * Usage:
 *   node tools/upstream-sync/report.js <from-ref> <to-ref>
 *   node tools/upstream-sync/report.js v2.21.1 v2.22.0
 */
const { execSync } = require("child_process")
const { normalise } = require("../codemods/scope-rename")

const [from, to] = process.argv.slice(2)
if (!from || !to) {
  console.error("usage: sync:report <from-ref> <to-ref>")
  process.exit(2)
}

// Ordered: first match wins, so the expensive buckets are checked first.
const BUCKETS = [
  { key: "REPLACED — triage by hand", cost: "high",
    test: (f) => /^packages\/core\/framework\/src\/http\//.test(f) ||
                 /^packages\/core\/orchestration\//.test(f) ||
                 /^packages\/core\/workflows-sdk\/src\/utils\/composer\//.test(f) ||
                 /^packages\/modules\/workflow-engine-/.test(f) ||
                 /^packages\/medusa\/src\/loaders\//.test(f) ||
                 /^packages\/medusa\/src\/commands\//.test(f) },
  { key: "workflows — re-run workflow codemods, then check determinism", cost: "high",
    test: (f) => /^packages\/core\/core-flows\//.test(f) },
  { key: "routes — re-run route + middleware codemods", cost: "medium",
    test: (f) => /^packages\/medusa\/src\/api\//.test(f) },
  { key: "build / workspace / CI — re-run yarn-to-pnpm", cost: "medium",
    test: (f) => /package\.json$/.test(f) || /^\.github\//.test(f) ||
                 /^(turbo\.json|.*tsconfig.*\.json|define_jest_config\.js|jest\.config\.js)$/.test(f) },
  { key: "domain — usually merges clean", cost: "low",
    test: (f) => /^packages\/modules\//.test(f) || /^packages\/core\//.test(f) },
  { key: "tests", cost: "low", test: (f) => /^integration-tests\//.test(f) },
  { key: "docs site", cost: "none", test: (f) => /^www\//.test(f) },
  { key: "other", cost: "low", test: () => true },
]

function changedFiles(a, b) {
  return execSync(`git diff --name-only ${a}..${b}`, { encoding: "utf8", maxBuffer: 256e6 })
    .trim().split("\n").filter(Boolean)
}

/** True when the only difference between the two sides is the scope rename. */
function scopeOnlyChange(file, a, b) {
  const read = (ref) => {
    // stderr silenced: `git show` is noisy for files added or deleted in the range,
    // which is expected and simply means "not a scope-only change".
    try {
      return execSync(`git show ${ref}:${JSON.stringify(file)}`,
        { encoding: "utf8", maxBuffer: 64e6, stdio: ["pipe", "pipe", "ignore"] })
    } catch { return null }
  }
  const x = read(a), y = read(b)
  if (x === null || y === null) return false
  return x !== y && normalise(x) === normalise(y)
}

const files = changedFiles(from, to)
const groups = new Map()
let scopeOnly = 0

for (const f of files) {
  if (scopeOnlyChange(f, from, to)) { scopeOnly++; continue }
  const b = BUCKETS.find((b) => b.test(f))
  if (!groups.has(b.key)) groups.set(b.key, { cost: b.cost, files: [] })
  groups.get(b.key).files.push(f)
}

console.log(`\nupstream ${from} -> ${to}`)
console.log(`${files.length} changed files` +
  (scopeOnly ? ` (${scopeOnly} differ only by the scope rename -- ignored)` : "") + "\n")

for (const b of BUCKETS) {
  const g = groups.get(b.key)
  if (!g) continue
  console.log(`[${g.cost.toUpperCase().padEnd(6)}] ${b.key}  -- ${g.files.length} files`)
  g.files.slice(0, 12).forEach((f) => console.log(`           ${f}`))
  if (g.files.length > 12) console.log(`           ... +${g.files.length - 12} more`)
  console.log()
}

if (groups.has("REPLACED — triage by hand")) {
  console.log("NOTE: upstream touched code this fork deleted or replaced. Those changes have")
  console.log("      no automatic path -- see docs/porting/UNPORTED.md before merging.\n")
}
