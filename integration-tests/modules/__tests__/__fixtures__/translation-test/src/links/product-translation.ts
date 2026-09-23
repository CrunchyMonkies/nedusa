import { defineLink } from "@nedusa/framework/utils"
import ProductModule from "@nedusa/medusa/product"
import Translation from "../modules/translation"

export default defineLink(
  ProductModule.linkable.product.id,
  Translation.linkable.translation.id
)
