import { validateAndTransformQuery } from "@nedusa/framework"
import { MiddlewareRoute } from "@nedusa/framework/http"
import * as QueryConfig from "./query-config"
import {
  StoreProductOptionParams,
  StoreProductOptionsParams,
} from "./validators"

export const storeProductOptionRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/product-options",
    middlewares: [
      validateAndTransformQuery(
        StoreProductOptionsParams,
        QueryConfig.listProductOptionConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/product-options/:id",
    middlewares: [
      validateAndTransformQuery(
        StoreProductOptionParams,
        QueryConfig.retrieveProductOptionConfig
      ),
    ],
  },
]
