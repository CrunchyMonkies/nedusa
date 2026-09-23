import { deleteSearchIndexWorkflow } from "@nedusa/core-flows"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@nedusa/framework/http"
import { HttpTypes } from "@nedusa/framework/types"
import { MedusaError, Modules } from "@nedusa/framework/utils"

/**
 * Delete a search index and everything built for it.
 */
export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminSearchIndexDeleteResponse>
) => {
  const searchModule = req.scope.resolve(Modules.SEARCH, {
    allowUnregistered: true,
  })

  if (!searchModule) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "The Search Module is not enabled"
    )
  }

  const { id } = req.params

  const { result } = await deleteSearchIndexWorkflow(req.scope).run({
    input: { index: id },
  })

  res.status(200).json({
    id,
    object: "search_index",
    deleted: true,
    deleted_versions: result.deleted_versions,
  })
}
