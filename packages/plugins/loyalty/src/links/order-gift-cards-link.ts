import { defineLink } from "@nedusa/framework/utils";
import OrderModule from "@nedusa/medusa/order";
import LoyaltyModule from "../modules/loyalty";

export default defineLink(
  { linkable: OrderModule.linkable.order, isList: true },
  {
    linkable: LoyaltyModule.linkable.giftCard,
    isList: true,
  }
);
