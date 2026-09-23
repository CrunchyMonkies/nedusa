import {
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@nedusa/framework";
import { MiddlewareRoute } from "@nedusa/medusa";
import { retrieveGiftCardTransformQueryConfig } from "./query-config";
import { StoreGetGiftCardParams, StoreRedeemGiftCard } from "./validators";

export const storeGiftCardsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/gift-cards/:code",
    middlewares: [
      validateAndTransformQuery(
        StoreGetGiftCardParams,
        retrieveGiftCardTransformQueryConfig
      ),
    ],
  },
];
