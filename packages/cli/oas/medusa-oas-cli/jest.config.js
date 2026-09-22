module.exports = {
  // Capped for the swapless dev VM: see define_jest_config.js and
  // docs/porting/06-pnpm-conventions.md. Override with JEST_MAX_WORKERS.
  maxWorkers: process.env.JEST_MAX_WORKERS || 4,
  transform: {
    "^.+\\.[jt]s?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        isolatedModules: false,
      },
    ],
  },
  testEnvironment: `node`,
  moduleFileExtensions: [`js`, `ts`],
  testTimeout: 100000,
}
