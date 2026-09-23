import { MedusaService, Module } from "@nedusa/framework/utils"

export default Module("moduleEmpty", {
  service: class ModuleEmptyService extends MedusaService({}) {},
})

