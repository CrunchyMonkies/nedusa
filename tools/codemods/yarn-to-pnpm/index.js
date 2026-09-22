#!/usr/bin/env node
/**
 * codemod: yarn-to-pnpm
 *
 * Rewrites yarn-berry-isms in workspace package.json "scripts" to pnpm equivalents.
 * Idempotent and re-runnable -- this is the transform applied to every future
 * upstream release import, so it must never need hand-editing afterwards.
 *
 *   yarn run -T <bin>                   ->  <bin>
 *   ../../node_modules/.bin/<bin>       ->  <bin>
 *   yarn run <script>                   ->  pnpm run <script>
 *   yarn <script>                       ->  pnpm run <script>
 *   yarn workspace <pkg> <script>       ->  pnpm --filter <pkg> run <script>
 *   npm run <script>                    ->  pnpm run <script>
 *
 * WHY the bare-binary rewrites are safe:
 *   `yarn run -T` means "run this binary from the workspace root". pnpm has no such
 *   flag, but it does not need one: pnpm (like npm) prepends every ANCESTOR
 *   node_modules/.bin to PATH when running a script, so a root devDependency's binary
 *   already resolves from inside any workspace package. Verified empirically against
 *   pnpm 11.23.0 with nodeLinker=hoisted before this codemod was written.
 *   That is also why the 136 relative "../../node_modules/.bin/x" paths can simply
 *   become "x" -- same resolution, no brittle relative depth.
 *
 * Usage: node tools/codemods/yarn-to-pnpm [--check] [root]
 *   --check  report what would change, write nothing, exit 1 if anything would
 */
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const args = process.argv.slice(2)
const check = args.includes("--check")
const root = args.find((a) => !a.startsWith("--")) || process.cwd()

const RULES = [
  // Order matters: most specific first.
  [/\byarn workspace (\S+) run (\S+)/g, "pnpm --filter $1 run $2"],
  [/\byarn workspace (\S+) (\S+)/g, "pnpm --filter $1 run $2"],
  [/\byarn run -T (\S+)/g, "$1"],
  [/(?:\.\.\/)+node_modules\/\.bin\/(\S+)/g, "$1"],
  [/\byarn run (\S+)/g, "pnpm run $1"],
  [/\byarn --cwd (\S+) (\S+)/g, "pnpm --dir $1 run $2"],
  // bare `yarn <script>`; guard against `yarn` alone and against already-converted text
  [/\byarn (?!run\b|workspace\b|--)([a-z][\w:.-]*)/g, "pnpm run $1"],
  [/\bnpm run (\S+)/g, "pnpm run $1"],
]

const files = execSync(
  `find . -name package.json -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path './www/*' -not -path '*/.medusa/*'`,
  { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
)
  .trim()
  .split("\n")
  .filter(Boolean)

let changedFiles = 0
let changedScripts = 0
const samples = []

for (const rel of files) {
  const file = path.join(root, rel)
  const raw = fs.readFileSync(file, "utf8")
  let pkg
  try {
    pkg = JSON.parse(raw)
  } catch {
    continue
  }
  if (!pkg.scripts) continue

  let touched = false
  for (const [name, value] of Object.entries(pkg.scripts)) {
    if (typeof value !== "string") continue
    let next = value
    for (const [re, to] of RULES) next = next.replace(re, to)
    if (next !== value) {
      if (samples.length < 12) samples.push(`${rel}  ${name}\n    -  ${value}\n    +  ${next}`)
      pkg.scripts[name] = next
      touched = true
      changedScripts++
    }
  }
  if (touched) {
    changedFiles++
    if (!check) {
      // preserve trailing newline convention
      fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + (raw.endsWith("\n") ? "\n" : ""))
    }
  }
}

console.log(samples.join("\n\n"))
console.log(
  `\n${check ? "[check] would rewrite" : "rewrote"} ${changedScripts} scripts across ${changedFiles} package.json files`
)
if (check && changedScripts > 0) process.exit(1)
