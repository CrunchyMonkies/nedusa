// Uses node:test rather than jest.
//
// This package is ESM (Nest 12 is ESM-only -- ADR-012) while the repo's jest setup is
// CommonJS via @swc/jest across 71 projects. node:test runs ESM natively with no
// transform, which sidesteps that mismatch for the whole packages/nest/* layer.
//
// Run: node --test packages/nest/config/dist/__tests__/
import assert from "node:assert/strict"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import { Test } from "@nestjs/testing"

import { ConfigModule } from "../config.module.js"
import { LEGACY_CONFIG_KEY, NEDUSA_CONFIG } from "../tokens.js"

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures")

async function compile(directory: string) {
  return Test.createTestingModule({
    imports: [ConfigModule.forRoot({ directory })],
  }).compile()
}

test("loads and normalises a real medusa-config", async () => {
  const moduleRef = await compile(FIXTURES)
  const config = moduleRef.get<any>(NEDUSA_CONFIG)

  assert.equal(config.projectConfig.databaseUrl, "postgres://u:p@localhost/nedusa_config_test")
  assert.equal(config.projectConfig.http.jwtSecret, "test-jwt")
  // defineConfig fills in the default module set; this asserts we get the NORMALISED
  // config, not the raw file contents.
  assert.ok(Object.keys(config.modules).length > 0, "expected default modules to be registered")

  await moduleRef.close()
})

test("the legacy 'configModule' key resolves the same instance", async () => {
  // Anything still going through ContainerCompat.resolve("configModule") during the
  // migration must get the identical object, not a second load of the file.
  const moduleRef = await compile(FIXTURES)
  assert.equal(moduleRef.get<any>(LEGACY_CONFIG_KEY), moduleRef.get<any>(NEDUSA_CONFIG))
  await moduleRef.close()
})

test("accepts a relative directory", async () => {
  // getConfigFile joins the directory into a require() path, so a relative path would
  // otherwise become a bare specifier and fail with a misleading "Cannot find module".
  const relative = FIXTURES.replace(`${process.cwd()}/`, "")
  const moduleRef = await compile(relative)
  assert.equal(moduleRef.get<any>(NEDUSA_CONFIG).projectConfig.http.cookieSecret, "test-cookie")
  await moduleRef.close()
})
