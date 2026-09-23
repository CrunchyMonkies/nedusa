import { definePolicies } from "@nedusa/framework/utils"
import { generateResourcePolicies } from "../utils"

const regionResources = ["region"]

export const regionPolicies = definePolicies(
  generateResourcePolicies(regionResources)
)
