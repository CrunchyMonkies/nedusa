import { ModuleProvider, Modules } from "@nedusa/framework/utils"
import { AccountHolderPaymentProvider } from "./services/account-holder-payment"

const services = [AccountHolderPaymentProvider]

export default ModuleProvider(Modules.PAYMENT, {
  services,
})
