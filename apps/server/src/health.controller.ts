import { Controller, Get } from "@nestjs/common"

/**
 * Upstream registers `/health` directly on the express app in
 * packages/medusa/src/commands/start.ts, *after* loaders() has run. The ordering
 * mattered there because the file-based router installs a catch-all; here it is an
 * ordinary controller.
 */
@Controller("health")
export class HealthController {
  @Get()
  check(): string {
    // Upstream responds with the bare string "OK", not JSON. The wire contract is
    // frozen (ADR-009), so this stays a string.
    return "OK"
  }
}
