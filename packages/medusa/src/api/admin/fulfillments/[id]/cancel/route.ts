import { cancelFulfillmentWorkflow } from "@nedusa/core-flows"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@nedusa/framework/http"
import { refetchFulfillment } from "../../helpers"
import { HttpTypes } from "@nedusa/framework/types"

export const POST = async (
  req: AuthenticatedMedusaRequest<{}, HttpTypes.AdminFulfillmentParams>,
  res: MedusaResponse<HttpTypes.AdminFulfillmentResponse>
) => {
  const { id } = req.params
  await cancelFulfillmentWorkflow(req.scope).run({
    input: { id },
  })

  const fulfillment = await refetchFulfillment(
    id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({ fulfillment })
}
