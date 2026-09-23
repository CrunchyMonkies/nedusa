import "./types"
import { SettingsModuleService } from "@/services"
import { Module } from "@nedusa/framework/utils"
import { Modules } from "@nedusa/utils"

export default Module(Modules.SETTINGS, {
  service: SettingsModuleService,
})

export * from "./utils"
