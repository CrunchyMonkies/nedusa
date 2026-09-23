import { ModuleProvider, Modules } from "@nedusa/framework/utils"
import { PostgresSearchService } from "./services/postgres-search"

const services = [PostgresSearchService]

export default ModuleProvider(Modules.SEARCH, {
  services,
})
