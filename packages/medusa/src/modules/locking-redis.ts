import RedisLockingProvider from "@nedusa/locking-redis"

export * from "@nedusa/locking-redis"

export default RedisLockingProvider
export const discoveryPath = require.resolve("@nedusa/locking-redis")
