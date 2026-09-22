module.exports = function defineJestConfig(config) {
  return {
    transform: {
      "^.+\\.[jt]s$": [
        "@swc/jest",
        {
          jsc: {
            parser: {
              syntax: "typescript",
              decorators: true,
            },
            transform: {
              useDefineForClassFields: false,
              legacyDecorator: true,
              decoratorMetadata: true,
            },
            target: "ES2021",
          },
          sourceMaps: "inline",
        },
      ],
    },
    modulePathIgnorePatterns: [`dist/`],
    testPathIgnorePatterns: [`dist/`, `node_modules/`, `__fixtures__/`, `__mocks__/`],
    transformIgnorePatterns: ["node_modules/(?!(until-async|msw)/)"],
    testEnvironment: `node`,
    // Cap worker count. Jest defaults to cpus-1 (31 here), and turbo runs several
    // packages at once, so the default fans out to ~1000 node processes across 85
    // workspaces. Combined with swap=0 on the dev WSL VM that OOM-kills the whole VM
    // rather than a single process. Override with JEST_MAX_WORKERS in CI if needed.
    maxWorkers: process.env.JEST_MAX_WORKERS || 4,
    moduleFileExtensions: [`js`, `ts`],
    ...config,
  }
}
