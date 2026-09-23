import { HttpTypes } from "@nedusa/framework/types"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@nedusa/framework/http"
import { Modules } from "@nedusa/framework/utils"

/**
 * List registered search indexes, their status, and the fields each stores.
 */
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminSearchIndexListResponse>
) => {
  const searchModule = req.scope.resolve(Modules.SEARCH, {
    allowUnregistered: true,
  })

  if (!searchModule) {
    res.json({ search_indexes: [], enabled: false })
    return
  }

  const search_indexes = await searchModule.listIndexes()

  res.json({ search_indexes, enabled: true })
}
