import * as entities from "./src/models"
import { defineMikroOrmCliConfig, Modules } from "@nedusa/framework/utils"

export default defineMikroOrmCliConfig(Modules.STORE, {
  entities: Object.values(entities),
})
