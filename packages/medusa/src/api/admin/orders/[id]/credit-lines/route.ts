import { createOrderCreditLinesWorkflow } from "@nedusa/core-flows"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@nedusa/framework/http"
import { HttpTypes } from "@nedusa/framework/types"
import { ContainerRegistrationKeys } from "@nedusa/framework/utils"

export const POST = async (
  req: AuthenticatedMedusaRequest<
    HttpTypes.AdminCreateOrderCreditLine,
    HttpTypes.AdminGetOrderParams
  >,
  res: MedusaResponse<HttpTypes.AdminOrderResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  await createOrderCreditLinesWorkflow(req.scope).run({
    input: { credit_lines: [req.validatedBody], id },
  })

  const {
    data: [order],
  } = await query.graph(
    {
      entity: "orders",
      fields: req.queryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  )

  res.status(200).json({ order })
}
