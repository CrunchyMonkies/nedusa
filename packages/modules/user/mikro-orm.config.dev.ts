import * as entities from "./src/models"
import { defineMikroOrmCliConfig, Modules } from "@nedusa/framework/utils"

export default defineMikroOrmCliConfig(Modules.USER, {
  entities: Object.values(entities),
})
