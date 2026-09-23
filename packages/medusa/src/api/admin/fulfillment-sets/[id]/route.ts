import { deleteFulfillmentSetsWorkflow } from "@nedusa/core-flows"
import { HttpTypes } from "@nedusa/framework/types"

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@nedusa/framework/http"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminFulfillmentSetDeleteResponse>
) => {
  const { id } = req.params

  await deleteFulfillmentSetsWorkflow(req.scope).run({
    input: { ids: [id] },
  })

  res.status(200).json({
    id,
    object: "fulfillment_set",
    deleted: true,
  })
}
