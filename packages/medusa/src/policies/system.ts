import { definePolicies } from "@nedusa/framework/utils"
import { generateResourcePolicies } from "../utils"

const systemResources = [
  "file",
  "notification",
  "workflow_execution",
  "store",
  "store_locale",
]

export const systemPolicies = definePolicies(
  generateResourcePolicies(systemResources)
)
