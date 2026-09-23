import { FulfillmentTypes } from "@nedusa/framework/types"

export type UpdateShippingOptionsInput = Required<
  Pick<FulfillmentTypes.UpdateShippingOptionDTO, "id">
> &
  FulfillmentTypes.UpdateShippingOptionDTO
