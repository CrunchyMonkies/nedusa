/// <reference types="vite/client" />

import react from "@vitejs/plugin-react"
// Imported from `vitest/config`, not `vite`: Vitest 4 no longer augments Vite's
// `UserConfig` with a `test` property, so `/// <reference types="vitest" />` plus
// Vite's own `defineConfig` no longer typechecks.
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/blocks": "/src/blocks",
      "@/components": "/src/components",
      "@/providers": "/src/providers",
      "@/hooks": "/src/hooks",
      "@/utils": "/src/utils",
      "@/types": "/src/types",
    },
  },
  test: {
    // Capped for the swapless dev VM (32GB, swap=0): vitest defaults to one thread
    // per core and turbo runs several packages at once. See
    // docs/porting/06-pnpm-conventions.md.
    poolOptions: { threads: { maxThreads: 4 }, forks: { maxForks: 4 } },
    setupFiles: "./setup-test.ts",
    coverage: {
      reporter: ["lcov", "text"],
      include: ["src/**"],
      exclude: ["**/*.stories.tsx", "**/index.ts"], // exclude stories and index files
    },
    globals: true,
    environment: "jsdom",
    css: false,
  },
})
