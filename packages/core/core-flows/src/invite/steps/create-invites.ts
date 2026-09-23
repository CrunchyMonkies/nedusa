import type {
  CreateInviteDTO,
  IUserModuleService,
} from "@nedusa/framework/types"
import { Modules } from "@nedusa/framework/utils"
import { StepResponse, createStep } from "@nedusa/framework/workflows-sdk"

export const createInviteStepId = "create-invite-step"
/**
 * This step creates one or more invites.
 *
 * @example
 * const data = createInviteStep([
 *   {
 *     email: "example@gmail.com"
 *   }
 * ])
 */
export const createInviteStep = createStep(
  createInviteStepId,
  async (input: CreateInviteDTO[], { container }) => {
    const service: IUserModuleService = container.resolve(Modules.USER)

    const createdInvites = await service.createInvites(input)

    return new StepResponse(
      createdInvites,
      createdInvites.map((inv) => inv.id)
    )
  },
  async (createdInvitesIds, { container }) => {
    if (!createdInvitesIds?.length) {
      return
    }

    const service: IUserModuleService = container.resolve(Modules.USER)

    await service.deleteInvites(createdInvitesIds)
  }
)
