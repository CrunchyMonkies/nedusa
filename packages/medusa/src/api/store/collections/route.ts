import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@nedusa/framework/http"
import { HttpTypes } from "@nedusa/framework/types"

import { ContainerRegistrationKeys } from "@nedusa/framework/utils"
import { publishedProductsContext } from "../utils/published-products-context"

export const GET = async (
  req: AuthenticatedMedusaRequest<HttpTypes.StoreCollectionListParams>,
  res: MedusaResponse<HttpTypes.StoreCollectionListResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: collections, metadata } = await query.graph(
    {
      entity: "product_collection",
      filters: req.filterableFields,
      pagination: req.queryConfig.pagination,
      fields: req.queryConfig.fields,
      context: publishedProductsContext(),
    },
    {
      locale: req.locale,
    }
  )

  res.json({
    collections,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
  })
}
