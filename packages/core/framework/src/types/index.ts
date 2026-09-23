import "@nedusa/utils"
export * from "@nedusa/types"

import type { ModuleOptions as ModuleOptionsType } from "@nedusa/types"

// Re-declare ModuleOptions to enable augmentation from @nedusa/framework/types
// EventBusEventsOptions is exported via "export *" and gets augmentations from @nedusa/utils
export interface ModuleOptions extends ModuleOptionsType {}
