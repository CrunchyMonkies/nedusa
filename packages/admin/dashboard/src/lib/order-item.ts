import { AdminOrderLineItem } from "@nedusa/types"

export const getFulfillableQuantity = (item: AdminOrderLineItem) => {
  return item.quantity - item.detail.fulfilled_quantity
}
