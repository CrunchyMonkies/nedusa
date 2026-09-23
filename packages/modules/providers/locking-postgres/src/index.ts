import { ModuleProvider, Modules } from "@nedusa/framework/utils"
import { PostgresAdvisoryLockProvider } from "./services/advisory-lock"

const services = [PostgresAdvisoryLockProvider]

export default ModuleProvider(Modules.LOCKING, {
  services,
})
