import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Capped for the swapless dev VM (32GB, swap=0): vitest defaults to one thread
    // per core and turbo runs several packages at once. See
    // docs/porting/06-pnpm-conventions.md.
    poolOptions: { threads: { maxThreads: 4 }, forks: { maxForks: 4 } },
    globals: true,
    environment: "node",
    include: ["**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
})
