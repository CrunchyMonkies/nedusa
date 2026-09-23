import { IModuleService } from "@nedusa/types"
import { MedusaContext } from "@nedusa/utils"

// @ts-expect-error
export class ModuleService implements IModuleService {
  public property = "value"

  constructor() {}
  async methodName(input, @MedusaContext() context) {
    return input + " called"
  }
}
