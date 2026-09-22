const glob = require(`glob`)

const pkgs = glob
  .sync(`${__dirname}/*/`)
  .map((p) => p.replace(__dirname, `<rootDir>/integration-tests`))

module.exports = {
  // Capped for the swapless dev VM: see define_jest_config.js and
  // docs/porting/06-pnpm-conventions.md. Override with JEST_MAX_WORKERS.
  maxWorkers: process.env.JEST_MAX_WORKERS || 4,
  testEnvironment: `node`,
  testTimeout: 10000,
  rootDir: `../`,
  roots: pkgs,
  projects: ["<rootDir>/integration-tests/http/jest.config.js"],
  testPathIgnorePatterns: [
    `/examples/`,
    `/www/`,
    `/dist/`,
    `/node_modules/`,
    `__tests__/fixtures`,
    `__testfixtures__`,
    `.cache`,
  ],
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
      },
    ],
  },
  setupFiles: ["<rootDir>/integration-tests/setup-env.js"],
  setupFilesAfterEnv: ["<rootDir>/integration-tests/setup.js"],
}
