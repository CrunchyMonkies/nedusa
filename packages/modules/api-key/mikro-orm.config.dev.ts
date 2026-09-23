import * as entities from "./src/models"
import { defineMikroOrmCliConfig, Modules } from "@nedusa/framework/utils"

export default defineMikroOrmCliConfig(Modules.API_KEY, {
  entities: Object.values(entities),
})
