import { allowFields, defineMiddlewares } from "@nedusa/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/carts/:id",
      middlewares: [allowFields("region.created_at")],
    },
  ],
})
