import {
  CreateOrderChangeDTO,
  IOrderModuleService,
} from "@nedusa/framework/types"
import { Modules } from "@nedusa/framework/utils"
import { StepResponse, createStep } from "@nedusa/framework/workflows-sdk"

export const createOrderChangeStepId = "create-order-change"
/**
 * This step creates an order change.
 */
export const createOrderChangeStep = createStep(
  createOrderChangeStepId,
  async (data: CreateOrderChangeDTO, { container }) => {
    const service = container.resolve<IOrderModuleService>(Modules.ORDER)

    const created = await service.createOrderChange(data)

    return new StepResponse(created, created.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }

    const service = container.resolve<IOrderModuleService>(Modules.ORDER)

    await service.deleteOrderChanges(id)
  }
)
