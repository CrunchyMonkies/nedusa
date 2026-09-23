import { validateAndTransformQuery } from "@nedusa/framework"
import { MiddlewareRoute } from "@nedusa/framework/http"
import { authenticate } from "../../../utils/middlewares/authenticate-middleware"
import { AdminGetSearchParams } from "./validators"

export const adminSearchRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/search",
    middlewares: [
      authenticate("user", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(AdminGetSearchParams, {
        isList: true,
        defaultLimit: 20,
      }),
    ],
  },
]
