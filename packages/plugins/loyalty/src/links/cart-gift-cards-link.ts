import { defineLink } from "@nedusa/framework/utils";
import CartModule from "@nedusa/medusa/cart";
import LoyaltyModule from "../modules/loyalty";

export default defineLink(
  { linkable: CartModule.linkable.cart, isList: true },
  {
    linkable: LoyaltyModule.linkable.giftCard,
    isList: true,
  }
);
