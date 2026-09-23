import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    // `@nedusa/dashboard`
    app: "./src/app.tsx",
    // `@nedusa/dashboard/components`
    components: "./src/exports/components.tsx",
    // `@nedusa/dashboard/hooks`
    hooks: "./src/exports/hooks.ts",
    // `@nedusa/dashboard/lib`
    lib: "./src/exports/lib.ts",
  },
  format: ["cjs", "esm"],
  external: [
    "virtual:medusa/forms",
    "virtual:medusa/displays",
    "virtual:medusa/routes",
    "virtual:medusa/links",
    "virtual:medusa/menu-items",
    "virtual:medusa/widgets",
    "virtual:medusa/i18n",
    "virtual:medusa/cell-renderers",
    "virtual:medusa/layouts",
    "virtual:medusa/search-entities",
  ],
  tsconfig: "tsconfig.build.json",
  dts: {
    entry: {
      index: "./src/index.ts",
      components: "./src/exports/components.tsx",
      hooks: "./src/exports/hooks.ts",
      lib: "./src/exports/lib.ts",
    },
  },
  clean: true,
})
