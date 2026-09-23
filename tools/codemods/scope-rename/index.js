#!/usr/bin/env node
/**
 * codemod: scope-rename
 *
 * Renames the npm scope @medusajs/* -> @nedusa/* across the fork.
 *
 * This is a TEXTUAL rename, deliberately. It is not enough to rewrite import
 * specifiers: package names also appear as RUNTIME STRINGS used for module
 * resolution. packages/core/utils/src/modules-sdk/definition.ts alone carries 36 of
 * them ("@medusajs/medusa/analytics", ...), and missing those breaks module loading at
 * runtime rather than at compile time.
 *
 * SCOPE
 *   included: packages/**, integration-tests/**, scripts/**, .github/**, and the root
 *             config files. Source, manifests, configs and CI.
 *   excluded: www/**            -- a separate workspace still on yarn, whose ~718 mdx
 *                                  files are prose about upstream. Renamed in Phase 5,
 *                                  when www is migrated.
 *             docs/porting/**   -- deliberately discusses upstream by name.
 *             CHANGELOG.md      -- upstream's release history; renaming it would be a lie.
 *             node_modules, dist, .medusa, .git
 *
 * NOT RENAMED: @medusajs/core-flows keeps its name (as @nedusa/core-flows). Renaming it
 * to "workflows" was considered and dropped -- it is a semantic rename on top of a scope
 * rename, and the package is restructured in Phase 2 for Temporal anyway. One change at
 * a time.
 *
 * MERGE COST: this makes an upstream import conflict on any hunk where upstream also
 * touches a line naming a package. That is bounded -- git merges per hunk, so a rename
 * on line 3 and an upstream change on line 50 do not conflict -- but it is real. The
 * paired `normalise` export below is what keeps DIFFS readable; see
 * tools/upstream-sync. See also docs/porting/adr/ADR-011-scope-rename.md.
 *
 * Usage: node tools/codemods/scope-rename [--check] [root]
 */
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const FROM = "@medusajs"
const TO = "@nedusa"

/**
 * Match the scope only where it is genuinely a package scope.
 *
 * The negative lookahead is load-bearing:
 *   - `.` excludes email addresses and domains -- "kasper@medusajs.com", and the author
 *     fields in 7 manifests, must NOT be renamed.
 *   - `-` excludes "@medusajs-bot", a GitHub account referenced in CI.
 *   - `\w` excludes any longer identifier that merely starts with the scope.
 *
 * Everything else following the scope is fair game, which matters more than it looks:
 *   "@medusajs/utils"    import specifier
 *   "@medusajs"          a bare namespace constant (eslint-plugin's PLUGIN_NAMESPACE)
 *   /^@medusajs\/[^/]+/  an ESCAPED slash inside a RegExp literal
 * The last two were missed by an earlier "@medusajs/" literal match, and the regex case
 * failed silently -- the lint rule simply stopped matching the fork's own packages.
 */
const SCOPE_RE = /@medusajs(?![.\-\w])/g
const UNSCOPE_RE = /@nedusa(?![.\-\w])/g

const INCLUDE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts", ".json", ".yaml", ".yml",
])

const ROOT_FILES = [
  "package.json", "turbo.json", "jest.config.js", "define_jest_config.js",
  ".eslintrc.js", "eslint.medusa.cjs", "http-types.config.json", "_tsconfig.base.json",
]

const SEARCH_DIRS = ["packages", "integration-tests", "scripts", ".github", ".changeset"]

function listFiles(root) {
  const out = []
  for (const dir of SEARCH_DIRS) {
    const abs = path.join(root, dir)
    if (!fs.existsSync(abs)) continue
    const found = execSync(
      `find ${JSON.stringify(abs)} -type f ` +
        `-not -path '*/node_modules/*' -not -path '*/dist/*' ` +
        `-not -path '*/.medusa/*' -not -path '*/.git/*'`,
      { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }
    )
      .trim()
      .split("\n")
      .filter(Boolean)
    out.push(...found)
  }
  for (const f of ROOT_FILES) {
    const abs = path.join(root, f)
    if (fs.existsSync(abs)) out.push(abs)
  }
  return out.filter((f) => INCLUDE_EXT.has(path.extname(f)))
}

/**
 * Normalise a blob so nedusa and upstream text can be compared without the rename
 * showing up as a difference. Used by the upstream-sync differ.
 */
function normalise(text) {
  return text.replace(UNSCOPE_RE, FROM)
}

function main() {
  const args = process.argv.slice(2)
  const check = args.includes("--check")
  const root = args.find((a) => !a.startsWith("--")) || process.cwd()

  let files = 0
  let occurrences = 0
  const samples = []

  for (const file of listFiles(root)) {
    let text
    try {
      text = fs.readFileSync(file, "utf8")
    } catch {
      continue
    }
    const matches = text.match(SCOPE_RE)
    if (!matches) continue
    const n = matches.length
    const next = text.replace(SCOPE_RE, TO)
    files++
    occurrences += n
    if (samples.length < 8) samples.push(`  ${path.relative(root, file)} (${n})`)
    if (!check) fs.writeFileSync(file, next)
  }

  if (samples.length) console.log(samples.join("\n"))
  console.log(
    `\n${check ? "[check] would rename" : "renamed"} ${occurrences} occurrences of ` +
      `"${FROM}" -> "${TO}" across ${files} files`
  )
  if (check && occurrences > 0) process.exit(1)
}

if (require.main === module) main()
module.exports = { normalise, FROM, TO, SCOPE_RE, UNSCOPE_RE }
