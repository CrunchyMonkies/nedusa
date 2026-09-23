import { ModuleProvider, Modules } from "@nedusa/framework/utils"
import { TaxDataProviderService } from "./services/tax-data-provider"

const services = [TaxDataProviderService]

export default ModuleProvider(Modules.TAX, {
  services,
})
