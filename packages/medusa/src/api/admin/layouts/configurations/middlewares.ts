import { validateAndTransformQuery } from "@nedusa/framework"
import { MiddlewareRoute } from "@nedusa/framework/http"
import * as QueryConfig from "./query-config"
import { AdminGetLayoutConfigurationsParams } from "./validators"

export const layoutConfigurationListRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/layouts/configurations",
    middlewares: [
      validateAndTransformQuery(
        AdminGetLayoutConfigurationsParams,
        QueryConfig.retrieveLayoutConfigurationList
      ),
    ],
  },
]
