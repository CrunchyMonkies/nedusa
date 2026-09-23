/**
 * tsc emits only TypeScript output, so the test fixtures -- a CommonJS medusa-config.js
 * and the package.json that marks it as CommonJS inside this ESM package -- have to be
 * staged into dist by hand.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs"

const src = "src/__tests__/fixtures"
const dest = "dist/__tests__/fixtures"

if (existsSync(src)) {
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
  console.log(`staged fixtures -> ${dest}`)
}
