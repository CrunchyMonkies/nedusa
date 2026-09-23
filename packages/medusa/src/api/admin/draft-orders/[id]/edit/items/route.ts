import { addDraftOrderItemsWorkflow } from "@nedusa/core-flows"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@nedusa/framework"
import { HttpTypes } from "@nedusa/types"
import { AdminAddDraftOrderItemsType } from "../../../validators"

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminAddDraftOrderItemsType>,
  res: MedusaResponse
) => {
  const { id } = req.params

  const { result } = await addDraftOrderItemsWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      order_id: id,
    },
  })

  res.json({
    draft_order_preview: result as unknown as HttpTypes.AdminOrderPreview,
  })
}
