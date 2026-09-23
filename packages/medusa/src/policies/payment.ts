import { definePolicies } from "@nedusa/framework/utils"
import { generateResourcePolicies } from "../utils"

const paymentResources = [
  "payment",
  "payment_collection",
  "payment_method",
  "payment_session",
  "refund_reason",
]

export const paymentPolicies = definePolicies(
  generateResourcePolicies(paymentResources)
)
