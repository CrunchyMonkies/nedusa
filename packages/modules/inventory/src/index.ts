import InventoryModuleService from "./services/inventory-module"
import { Module, Modules } from "@nedusa/framework/utils"

export default Module(Modules.INVENTORY, {
  service: InventoryModuleService,
})
