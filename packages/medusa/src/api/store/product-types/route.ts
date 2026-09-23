import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@nedusa/framework/http"
import { HttpTypes } from "@nedusa/framework/types"
import { ContainerRegistrationKeys } from "@nedusa/framework/utils"
import { publishedProductsContext } from "../utils/published-products-context"

export const GET = async (
  req: AuthenticatedMedusaRequest<HttpTypes.StoreProductTypeListParams>,
  res: MedusaResponse<HttpTypes.StoreProductTypeListResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: product_types, metadata } = await query.graph(
    {
      entity: "product_type",
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
    product_types,
    count: metadata?.count ?? 0,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 0,
  })
}
