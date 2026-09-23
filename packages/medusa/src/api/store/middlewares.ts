import { MiddlewareRoute } from "@nedusa/framework/http"
import { storeLocalesRoutesMiddlewares } from "./locales/middlewares"
import { storeReturnsRoutesMiddlewares } from "./returns/middlewares"
import { storeSearchRoutesMiddlewares } from "./search/middlewares"

export const storeRoutesMiddlewares: MiddlewareRoute[] = [
  ...storeLocalesRoutesMiddlewares,
  ...storeReturnsRoutesMiddlewares,
  ...storeSearchRoutesMiddlewares,
]
