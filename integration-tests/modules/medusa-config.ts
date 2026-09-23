import { defineConfig } from "@nedusa/utils"

const { Modules } = require("@nedusa/utils")

const DB_HOST = process.env.DB_HOST
const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_TEMP_NAME
const DB_URL = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`
process.env.POSTGRES_URL = DB_URL
process.env.LOG_LEVEL = "error"

const customTaxProviderRegistration = {
  resolve: {
    services: [require("@nedusa/tax/dist/providers/system").default],
  },
  id: "system_2",
}

const customPaymentProvider = {
  resolve: {
    services: [require("@nedusa/payment/dist/providers/system").default],
  },
  id: "default_2",
}

const customFulfillmentProvider = {
  resolve: "@nedusa/fulfillment-manual",
  id: "test-provider",
}

const customFulfillmentProviderCalculated = {
  resolve: require("./dist/utils/providers/fulfillment-manual-calculated")
    .default,
  id: "test-provider-calculated",
}

module.exports = defineConfig({
  admin: {
    disable: true,
  },
  plugins: [
    {
      resolve: "@nedusa/loyalty-plugin",
      options: {},
    },
  ],
  projectConfig: {
    databaseUrl: DB_URL,
    databaseType: "postgres",
    http: {
      jwtSecret: "test",
      cookieSecret: "test",
    },
  },
  featureFlags: {},
  modules: [
    {
      key: "testingModule",
      resolve: "__tests__/__fixtures__/testing-module",
    },
    {
      key: "auth",
      resolve: "@nedusa/auth",
      options: {
        providers: [
          {
            id: "emailpass",
            resolve: "@nedusa/auth-emailpass",
          },
        ],
      },
    },
    {
      key: Modules.USER,
      scope: "internal",
      resolve: "@nedusa/user",
      options: {
        jwt_secret: "test",
      },
    },
    {
      key: Modules.CACHE,
      resolve: "@nedusa/cache-inmemory",
      options: { ttl: 0 }, // Cache disabled
    },
    {
      key: Modules.LOCKING,
      resolve: "@nedusa/locking",
    },
    {
      key: Modules.STOCK_LOCATION,
      resolve: "@nedusa/stock-location",
      options: {},
    },
    {
      key: Modules.INVENTORY,
      resolve: "@nedusa/inventory",
      options: {},
    },
    {
      key: Modules.PRODUCT,
      resolve: "@nedusa/product",
    },
    {
      key: Modules.PRICING,
      resolve: "@nedusa/pricing",
    },
    {
      key: Modules.PROMOTION,
      resolve: "@nedusa/promotion",
    },
    {
      key: Modules.REGION,
      resolve: "@nedusa/region",
    },
    {
      key: Modules.CUSTOMER,
      resolve: "@nedusa/customer",
    },
    {
      key: Modules.SALES_CHANNEL,
      resolve: "@nedusa/sales-channel",
    },
    {
      key: Modules.CART,
      resolve: "@nedusa/cart",
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: "@nedusa/workflow-engine-inmemory",
    },
    {
      key: Modules.API_KEY,
      resolve: "@nedusa/api-key",
    },
    {
      key: Modules.STORE,
      resolve: "@nedusa/store",
    },
    {
      key: Modules.TAX,
      resolve: "@nedusa/tax",
      options: {
        providers: [customTaxProviderRegistration],
      },
    },
    {
      key: Modules.CURRENCY,
      resolve: "@nedusa/currency",
    },
    {
      key: Modules.ORDER,
      resolve: "@nedusa/order",
    },
    {
      key: Modules.PAYMENT,
      resolve: "@nedusa/payment",
      options: {
        providers: [customPaymentProvider],
      },
    },
    {
      key: Modules.FULFILLMENT,
      resolve: "@nedusa/fulfillment",
      options: {
        providers: [
          customFulfillmentProvider,
          customFulfillmentProviderCalculated,
        ],
      },
    },
    {
      key: Modules.NOTIFICATION,
      options: {
        providers: [
          {
            resolve: "@nedusa/notification-local",
            id: "local-notification-provider",
            options: {
              name: "Local Notification Provider",
              channels: ["log", "email"],
            },
          },
        ],
      },
    },
    {
      key: Modules.INDEX,
      resolve: "@nedusa/index",
      disable: process.env.ENABLE_INDEX_MODULE !== "true",
    },
    {
      key: "brand",
      resolve: "src/modules/brand",
    },
    {
      key: Modules.RBAC,
      resolve: "@nedusa/rbac",
    },
  ],
})
