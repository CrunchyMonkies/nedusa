import { ModuleExports } from "@nedusa/types"
import { ModuleService } from "./services/module-service"
import { Module } from "@nedusa/utils"

const moduleExports: ModuleExports = {
  service: ModuleService,
}

export * from "./services/module-service"

export default Module("module-with-providers", moduleExports)
