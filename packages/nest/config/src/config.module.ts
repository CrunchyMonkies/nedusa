import { isAbsolute, resolve as resolvePath } from "node:path"

import { Global, Module } from "@nestjs/common"
import type { DynamicModule } from "@nestjs/common"

// Medusa's own config loader. Framework-agnostic: it reads medusa-config.ts, then
// validates and normalises it. Ported by wrapping, not rewriting -- see
// docs/porting/00-overview.md on what deliberately does not diverge.
import { configLoader } from "@nedusa/framework/config"
import type { ConfigModule as NedusaConfig } from "@nedusa/framework/types"

import { LEGACY_CONFIG_KEY, NEDUSA_CONFIG } from "./tokens.js"

/**
 * Upstream's `getConfigFile` joins the directory into a require() path. A RELATIVE
 * directory therefore becomes a bare specifier, and Node reports
 * `Cannot find module 'mydir/medusa-config'` -- which reads like a missing dependency
 * rather than a path mistake. Resolve against cwd so callers can pass either.
 */
function resolveDirectory(directory: string): string {
  return isAbsolute(directory) ? directory : resolvePath(process.cwd(), directory)
}

export type ConfigModuleOptions = {
  /** Directory to resolve the config file from. Relative paths resolve against cwd. */
  directory: string
  /** Defaults to "medusa-config", as upstream does. */
  configFileName?: string
  /**
   * Upstream's build and compile commands load config without failing on validation
   * errors. Defaults to true, matching `configLoader`.
   */
  throwOnValidationError?: boolean
}

/**
 * Makes the loaded Medusa configuration injectable.
 *
 * Global because upstream treats config as ambient -- it is resolvable from the root
 * container anywhere -- and reproducing that avoids threading an import through every
 * module that needs it.
 *
 * NOTE: importing `@nedusa/framework/config` has a module-scope side effect. Its
 * `loader.ts` registers the config into the process-global awilix container on import.
 * That is Hazard 3 in the plan (process-global statics, which break
 * Test.createTestingModule isolation) and is addressed later in Phase 1. It is harmless
 * here -- the legacy container still exists during the migration -- but it is the reason
 * this module cannot yet be instantiated twice in one process.
 */
@Global()
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigModuleOptions): DynamicModule {
    const configProvider = {
      provide: NEDUSA_CONFIG,
      useFactory: async (): Promise<NedusaConfig> =>
        configLoader(resolveDirectory(options.directory), options.configFileName ?? "medusa-config", {
          throwOnValidationError: options.throwOnValidationError ?? true,
        }),
    }

    // Same instance under the legacy string key, so code still going through
    // ContainerCompat.resolve("configModule") gets the identical object rather than a
    // second load.
    const legacyAlias = {
      provide: LEGACY_CONFIG_KEY,
      useExisting: NEDUSA_CONFIG,
    }

    return {
      module: ConfigModule,
      providers: [configProvider, legacyAlias],
      exports: [NEDUSA_CONFIG, LEGACY_CONFIG_KEY],
    }
  }
}
