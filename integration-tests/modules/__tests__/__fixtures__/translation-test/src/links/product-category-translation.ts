import ProductModule from "@nedusa/medusa/product"
import { defineLink } from "@nedusa/utils"
import Translation from "../modules/translation"

export default defineLink(
  ProductModule.linkable.productCategory.id,
  Translation.linkable.translation.id
)
