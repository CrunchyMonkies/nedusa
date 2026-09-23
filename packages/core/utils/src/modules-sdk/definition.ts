export const Modules = {
  ANALYTICS: "analytics",
  AUTH: "auth",
  CACHE: "cache",
  CART: "cart",
  CUSTOMER: "customer",
  EVENT_BUS: "event_bus",
  INVENTORY: "inventory",
  LINK: "link_modules",
  PAYMENT: "payment",
  PRICING: "pricing",
  PRODUCT: "product",
  PROMOTION: "promotion",
  SALES_CHANNEL: "sales_channel",
  TAX: "tax",
  FULFILLMENT: "fulfillment",
  STOCK_LOCATION: "stock_location",
  USER: "user",
  WORKFLOW_ENGINE: "workflows",
  REGION: "region",
  ORDER: "order",
  API_KEY: "api_key",
  STORE: "store",
  CURRENCY: "currency",
  FILE: "file",
  NOTIFICATION: "notification",
  INDEX: "index",
  SEARCH: "search",
  LOCKING: "locking",
  SETTINGS: "settings",
  CACHING: "caching",
  TRANSLATION: "translation",
  RBAC: "rbac",
} as const

export const MODULE_PACKAGE_NAMES = {
  [Modules.ANALYTICS]: "@nedusa/medusa/analytics",
  [Modules.AUTH]: "@nedusa/medusa/auth",
  [Modules.CACHE]: "@nedusa/medusa/cache-inmemory",
  [Modules.CART]: "@nedusa/medusa/cart",
  [Modules.CUSTOMER]: "@nedusa/medusa/customer",
  [Modules.EVENT_BUS]: "@nedusa/medusa/event-bus-local",
  [Modules.INVENTORY]: "@nedusa/medusa/inventory",
  [Modules.LINK]: "@nedusa/medusa/link-modules",
  [Modules.PAYMENT]: "@nedusa/medusa/payment",
  [Modules.PRICING]: "@nedusa/medusa/pricing",
  [Modules.PRODUCT]: "@nedusa/medusa/product",
  [Modules.PROMOTION]: "@nedusa/medusa/promotion",
  [Modules.SALES_CHANNEL]: "@nedusa/medusa/sales-channel",
  [Modules.FULFILLMENT]: "@nedusa/medusa/fulfillment",
  [Modules.STOCK_LOCATION]: "@nedusa/medusa/stock-location",
  [Modules.TAX]: "@nedusa/medusa/tax",
  [Modules.USER]: "@nedusa/medusa/user",
  [Modules.WORKFLOW_ENGINE]: "@nedusa/medusa/workflow-engine-inmemory",
  [Modules.REGION]: "@nedusa/medusa/region",
  [Modules.ORDER]: "@nedusa/medusa/order",
  [Modules.API_KEY]: "@nedusa/medusa/api-key",
  [Modules.STORE]: "@nedusa/medusa/store",
  [Modules.CURRENCY]: "@nedusa/medusa/currency",
  [Modules.FILE]: "@nedusa/medusa/file",
  [Modules.NOTIFICATION]: "@nedusa/medusa/notification",
  [Modules.INDEX]: "@nedusa/medusa/index-module",
  [Modules.SEARCH]: "@nedusa/medusa/search",
  [Modules.LOCKING]: "@nedusa/medusa/locking",
  [Modules.SETTINGS]: "@nedusa/medusa/settings",
  [Modules.CACHING]: "@nedusa/medusa/caching",
  [Modules.TRANSLATION]: "@nedusa/medusa/translation",
  [Modules.RBAC]: "@nedusa/medusa/rbac",
}

export const REVERSED_MODULE_PACKAGE_NAMES = Object.entries(
  MODULE_PACKAGE_NAMES
).reduce((acc, [key, value]) => {
  acc[value] = key
  return acc
}, {})

// TODO: temporary fix until the event bus, cache and workflow engine are migrated to use providers and therefore only a single resolution will be good
export const TEMPORARY_REDIS_MODULE_PACKAGE_NAMES = {
  [Modules.EVENT_BUS]: "@nedusa/medusa/event-bus-redis",
  [Modules.CACHE]: "@nedusa/medusa/cache-redis",
  [Modules.WORKFLOW_ENGINE]: "@nedusa/medusa/workflow-engine-redis",
  [Modules.LOCKING]: "@nedusa/medusa/locking-redis",
}

REVERSED_MODULE_PACKAGE_NAMES[
  TEMPORARY_REDIS_MODULE_PACKAGE_NAMES[Modules.EVENT_BUS]
] = Modules.EVENT_BUS
REVERSED_MODULE_PACKAGE_NAMES[
  TEMPORARY_REDIS_MODULE_PACKAGE_NAMES[Modules.CACHE]
] = Modules.CACHE
REVERSED_MODULE_PACKAGE_NAMES[
  TEMPORARY_REDIS_MODULE_PACKAGE_NAMES[Modules.WORKFLOW_ENGINE]
] = Modules.WORKFLOW_ENGINE
REVERSED_MODULE_PACKAGE_NAMES[
  TEMPORARY_REDIS_MODULE_PACKAGE_NAMES[Modules.LOCKING]
] = Modules.LOCKING

/**
 * Making modules be referenced as a type as well.
 */
export type Modules = (typeof Modules)[keyof typeof Modules]
export const ModuleRegistrationName = Modules
