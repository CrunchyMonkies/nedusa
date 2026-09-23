import {
  MedusaContainer,
  PaymentCollectionDTO,
} from "@nedusa/framework/types"
import { refetchEntity } from "@nedusa/framework/http"

export const refetchPaymentCollection = async (
  id: string,
  scope: MedusaContainer,
  fields: string[]
): Promise<PaymentCollectionDTO> => {
  return refetchEntity({
    entity: "payment_collection",
    idOrFilter: id,
    scope,
    fields,
  })
}
