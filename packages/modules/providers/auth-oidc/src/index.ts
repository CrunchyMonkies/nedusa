import { ModuleProvider, Modules } from "@nedusa/framework/utils"
import { OidcAuthService } from "./services/oidc"

const services = [OidcAuthService]

export default ModuleProvider(Modules.AUTH, {
  services,
})
