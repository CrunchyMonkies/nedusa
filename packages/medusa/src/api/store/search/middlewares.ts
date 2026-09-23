import { validateAndTransformBody } from "@nedusa/framework"
import { authenticate, MiddlewareRoute } from "@nedusa/framework/http"
import { StoreSearch } from "./validators"

export const storeSearchRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/store/search",
    middlewares: [
      authenticate("customer", ["session", "bearer"], {
        allowUnauthenticated: true,
      }),
      validateAndTransformBody(StoreSearch),
    ],
  },
]
