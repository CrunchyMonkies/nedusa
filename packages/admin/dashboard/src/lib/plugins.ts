import { HttpTypes } from "@nedusa/types"

export const LOYALTY_PLUGIN_NAME = "@nedusa/loyalty-plugin"

export const getLoyaltyPlugin = (plugins: HttpTypes.AdminPlugin[]) => {
  return plugins?.find((plugin) => plugin.name === LOYALTY_PLUGIN_NAME)
}
