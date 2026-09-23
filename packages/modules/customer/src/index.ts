import { CustomerModuleService } from "@services"
import { Module, Modules } from "@nedusa/framework/utils"

export default Module(Modules.CUSTOMER, {
  service: CustomerModuleService,
})
