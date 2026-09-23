import { Module } from "@nestjs/common"

// ESM requires the extension on relative imports, even in TypeScript: the specifier is
// emitted verbatim and resolved by Node at runtime, where ".js" is the built file.
import { HealthController } from "./health.controller.js"

/**
 * The root module.
 *
 * Deliberately near-empty. The substrate modules it will import -- config, database,
 * modules-runtime, temporal -- are built across Phases 1 and 2; see
 * docs/porting/00-overview.md for where the port currently is.
 */
@Module({
  controllers: [HealthController],
})
export class AppModule {}
