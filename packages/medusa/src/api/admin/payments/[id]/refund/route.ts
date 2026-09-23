import { refundPaymentWorkflow } from "@nedusa/core-flows"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@nedusa/framework/http"
import { refetchPayment } from "../../helpers"
import { HttpTypes } from "@nedusa/framework/types"

export const POST = async (
  req: AuthenticatedMedusaRequest<
    HttpTypes.AdminRefundPayment,
    HttpTypes.SelectParams
  >,
  res: MedusaResponse<HttpTypes.AdminPaymentResponse>
) => {
  const { id } = req.params
  await refundPaymentWorkflow(req.scope).run({
    input: {
      payment_id: id,
      created_by: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })

  const payment = await refetchPayment(id, req.scope, req.queryConfig.fields)

  res.status(200).json({ payment })
}
