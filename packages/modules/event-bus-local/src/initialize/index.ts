import { MedusaModule } from "@nedusa/framework/modules-sdk"
import { IEventBusService } from "@nedusa/framework/types"
import { Modules } from "@nedusa/framework/utils"

export const initialize = async (): Promise<IEventBusService> => {
  const serviceKey = Modules.EVENT_BUS
  const loaded = await MedusaModule.bootstrap<IEventBusService>({
    moduleKey: serviceKey,
    defaultPath: "@nedusa/event-bus-local",
  })

  return loaded[serviceKey]
}
