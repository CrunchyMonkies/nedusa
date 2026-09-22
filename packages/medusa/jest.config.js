module.exports = {
  // Capped for the swapless dev VM: see define_jest_config.js and
  // docs/porting/06-pnpm-conventions.md. Override with JEST_MAX_WORKERS.
  maxWorkers: process.env.JEST_MAX_WORKERS || 4,
  //moduleNameMapper: {
  //  "^highlight.js$": `<rootDir>/node_modules/highlight.js/lib/index.js`,
  //},
  //snapshotSerializers: [`jest-serializer-path`],
  // collectCoverageFrom: coverageDirs,
  //reporters: process.env.CI
  //  ? [[`jest-silent-reporter`, { useDots: true }]].concat(
  //      useCoverage ? `jest-junit` : []
  //    )
  //  : [`default`].concat(useCoverage ? `jest-junit` : []),
  transform: { "^.+\\.[jt]s?$": "@swc/jest" },
  modulePathIgnorePatterns: ["__fixtures__", "node_modules", "dist"],
  testEnvironment: `node`,
  moduleFileExtensions: [`js`, `ts`],
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
}
