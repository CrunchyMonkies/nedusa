import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@nedusa/framework/http"
import { z } from "@nedusa/framework/zod"

const CustomPostSchema = z.object({
  foo: z.string(),
})

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/custom",
      middlewares: [validateAndTransformBody(CustomPostSchema)],
    },
  ],
})
