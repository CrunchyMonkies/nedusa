import { definePolicies } from "@nedusa/framework/utils"
import { generateResourcePolicies } from "../utils"

const translationResources = ["translation", "translation_setting"]

export const translationPolicies = definePolicies(
  generateResourcePolicies(translationResources)
)
