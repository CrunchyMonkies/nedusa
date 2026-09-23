import { createRuleTester } from "../../../test-utils"
import { rule } from "../rule"

const ruleTester = createRuleTester()

ruleTester.run("import-from-framework-not-internal", rule, {
  valid: [
    // Canonical framework entry points.
    { code: `import { MedusaError } from "@nedusa/framework/utils"` },
    { code: `import type { Context } from "@nedusa/framework/types"` },
    {
      code: `import { createWorkflow } from "@nedusa/framework/workflows-sdk"`,
    },
    { code: `import { defineMiddlewares } from "@nedusa/framework/http"` },
    // Other public packages are fine.
    { code: `import { deleteOrderWorkflow } from "@nedusa/core-flows"` },
    { code: `import { defineWidgetConfig } from "@nedusa/admin-sdk"` },
    // Unrelated third-party import.
    { code: `import { z } from "zod"` },
    // A @nedusa package whose name merely contains "dist" — not a dist deep import.
    { code: `import x from "@nedusa/some-dist-thing"` },
    // Public subpath that isn't dist.
    { code: `import { Modules } from "@nedusa/framework/utils"` },
  ],
  invalid: [
    // Deprecated standalone package → framework subpath (autofix).
    {
      code: `import { MedusaError } from "@nedusa/utils"`,
      output: `import { MedusaError } from "@nedusa/framework/utils"`,
      errors: [{ messageId: "useFrameworkEntrypoint" }],
    },
    {
      code: `import type { Context } from "@nedusa/types"`,
      output: `import type { Context } from "@nedusa/framework/types"`,
      errors: [{ messageId: "useFrameworkEntrypoint" }],
    },
    {
      code: `import { createWorkflow } from "@nedusa/workflows-sdk"`,
      output: `import { createWorkflow } from "@nedusa/framework/workflows-sdk"`,
      errors: [{ messageId: "useFrameworkEntrypoint" }],
    },
    {
      code: `import { MedusaModule } from "@nedusa/modules-sdk"`,
      output: `import { MedusaModule } from "@nedusa/framework/modules-sdk"`,
      errors: [{ messageId: "useFrameworkEntrypoint" }],
    },
    {
      code: `import { TransactionOrchestrator } from "@nedusa/orchestration"`,
      output: `import { TransactionOrchestrator } from "@nedusa/framework/orchestration"`,
      errors: [{ messageId: "useFrameworkEntrypoint" }],
    },
    // Quote style preserved on autofix.
    {
      code: `import { MedusaError } from '@nedusa/utils'`,
      output: `import { MedusaError } from '@nedusa/framework/utils'`,
      errors: [{ messageId: "useFrameworkEntrypoint" }],
    },
    // Re-export of a deprecated package.
    {
      code: `export { MedusaError } from "@nedusa/utils"`,
      output: `export { MedusaError } from "@nedusa/framework/utils"`,
      errors: [{ messageId: "useFrameworkEntrypoint" }],
    },
    {
      code: `export * from "@nedusa/types"`,
      output: `export * from "@nedusa/framework/types"`,
      errors: [{ messageId: "useFrameworkEntrypoint" }],
    },
    // Deep dist import of the main package → no autofix.
    {
      code: `import { foo } from "@nedusa/medusa/dist/utils/foo"`,
      errors: [{ messageId: "noInternalImport" }],
    },
    // Deep dist import of the framework package → no autofix.
    {
      code: `import { bar } from "@nedusa/framework/dist/utils"`,
      errors: [{ messageId: "noInternalImport" }],
    },
    // dist as the trailing segment.
    {
      code: `import x from "@nedusa/medusa/dist"`,
      errors: [{ messageId: "noInternalImport" }],
    },
    // Nested dist segment.
    {
      code: `import x from "@nedusa/product/dist/services/product"`,
      errors: [{ messageId: "noInternalImport" }],
    },
    // Re-export from internal build output.
    {
      code: `export { x } from "@nedusa/medusa/dist/x"`,
      errors: [{ messageId: "noInternalImport" }],
    },
  ],
})
