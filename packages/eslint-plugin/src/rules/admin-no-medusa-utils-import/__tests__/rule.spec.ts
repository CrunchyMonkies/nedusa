import { createRuleTester } from "../../../test-utils"
import { rule } from "../rule"

const ruleTester = createRuleTester()

ruleTester.run("admin-no-medusa-utils-import", rule, {
  valid: [
    // The admin SDK is the supported, browser-safe entry point.
    { code: `import { defineWidgetConfig } from "@nedusa/admin-sdk"` },
    // Types are erased at build time — safe to import.
    { code: `import type { HttpTypes } from "@nedusa/framework/types"` },
    // The JS SDK is browser-safe.
    { code: `import Medusa from "@nedusa/js-sdk"` },
    // Unrelated third-party imports.
    { code: `import { useState } from "react"` },
    { code: `import { z } from "zod"` },
    // A subpath whose name merely starts the same way — not an exact match.
    { code: `import x from "@nedusa/framework/utils-extra"` },
  ],
  invalid: [
    {
      code: `import { MedusaError } from "@nedusa/framework/utils"`,
      errors: [{ messageId: "nodeOnlyImportInAdmin" }],
    },
    {
      code: `import { defineMiddlewares } from "@nedusa/framework/http"`,
      errors: [{ messageId: "nodeOnlyImportInAdmin" }],
    },
    {
      code: `import { createWorkflow } from "@nedusa/framework/workflows-sdk"`,
      errors: [{ messageId: "nodeOnlyImportInAdmin" }],
    },
    // Single quotes are matched too.
    {
      code: `import { Modules } from '@nedusa/framework/utils'`,
      errors: [{ messageId: "nodeOnlyImportInAdmin" }],
    },
    // Side-effect-only import.
    {
      code: `import "@nedusa/framework/utils"`,
      errors: [{ messageId: "nodeOnlyImportInAdmin" }],
    },
    // Re-export of a Node-only module.
    {
      code: `export { MedusaError } from "@nedusa/framework/utils"`,
      errors: [{ messageId: "nodeOnlyImportInAdmin" }],
    },
    {
      code: `export * from "@nedusa/framework/http"`,
      errors: [{ messageId: "nodeOnlyImportInAdmin" }],
    },
  ],
})
