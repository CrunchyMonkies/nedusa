// CommonJS on purpose: this is what a real Medusa project ships, and loading it from the
// ESM Nest layer is part of what the test verifies.
//
// The sibling package.json declaring "type": "commonjs" is required. This package is ESM,
// so without it Node treats this .js as ESM and `require` is undefined. A real project is
// its own package and gets this for free; a fixture inside an ESM package does not.
const { defineConfig } = require("@nedusa/utils")

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: "postgres://u:p@localhost/nedusa_config_test",
    http: {
      storeCors: "http://localhost:8000",
      adminCors: "http://localhost:9000",
      authCors: "http://localhost:9000",
      jwtSecret: "test-jwt",
      cookieSecret: "test-cookie",
    },
  },
})
