import { validateAndTransformBody } from "@nedusa/framework"
import { MiddlewareRoute } from "@nedusa/framework/http"
import { AdminSetLayoutConfiguration } from "./validators"

export const layoutConfigurationRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/layouts/:zone/configuration",
    middlewares: [validateAndTransformBody(AdminSetLayoutConfiguration)],
  },
]
