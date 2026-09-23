import { StoreModuleService } from "@services"
import { Module, Modules } from "@nedusa/framework/utils"

export default Module(Modules.STORE, {
  service: StoreModuleService,
})
