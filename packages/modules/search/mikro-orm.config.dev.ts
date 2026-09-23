import { defineMikroOrmCliConfig, Modules } from "@nedusa/framework/utils"
import * as entities from "./src/models"

export default defineMikroOrmCliConfig(Modules.SEARCH, {
  entities: Object.values(entities),
})
