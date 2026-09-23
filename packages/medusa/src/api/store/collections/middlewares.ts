import * as QueryConfig from "./query-config"
import { MiddlewareRoute } from "@nedusa/framework/http"
import { validateAndTransformQuery } from "@nedusa/framework"
import {
  StoreGetCollectionParams,
  StoreGetCollectionsParams,
} from "./validators"

export const storeCollectionRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/collections",
    middlewares: [
      validateAndTransformQuery(
        StoreGetCollectionsParams,
        QueryConfig.listTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/collections/:id",
    middlewares: [
      validateAndTransformQuery(
        StoreGetCollectionParams,
        QueryConfig.retrieveTransformQueryConfig
      ),
    ],
  },
]
