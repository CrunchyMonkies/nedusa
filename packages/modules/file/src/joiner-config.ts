import { defineJoinerConfig, Modules } from "@nedusa/framework/utils"

export const joinerConfig = defineJoinerConfig(Modules.FILE, {
  models: [{ name: "File" }],
})
