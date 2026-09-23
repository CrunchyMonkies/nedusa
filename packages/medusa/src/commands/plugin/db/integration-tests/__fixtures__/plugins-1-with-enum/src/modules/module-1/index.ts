import { MedusaService, Module } from "@nedusa/framework/utils"
export default Module("module1_with_enum", {
  service: class Module1Service extends MedusaService({}) {},
})
