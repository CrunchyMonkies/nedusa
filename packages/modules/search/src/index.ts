import "./types"

import { Module, Modules } from "@nedusa/framework/utils"
import { SearchModuleService } from "@services"
import providersLoader from "./loaders/providers"

export default Module(Modules.SEARCH, {
  service: SearchModuleService,
  loaders: [providersLoader],
})
