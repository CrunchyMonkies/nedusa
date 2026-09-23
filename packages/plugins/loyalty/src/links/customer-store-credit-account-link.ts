import { defineLink } from "@nedusa/framework/utils";
import CustomerModule from "@nedusa/medusa/customer";
import StoreCreditModule from "../modules/store-credit";

defineLink(
  {
    linkable: StoreCreditModule.linkable.storeCreditAccount,
    field: "customer_id",
  },
  CustomerModule.linkable.customer,
  { readOnly: true, isList: false }
);
