import { ModuleProvider, Modules } from "@nedusa/framework/utils"
import { PosthogAnalyticsService } from "./services/posthog-analytics"

const services = [PosthogAnalyticsService]

export default ModuleProvider(Modules.ANALYTICS, {
  services,
})
