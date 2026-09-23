import PostgresLockingProvider from "@nedusa/locking-postgres"

export * from "@nedusa/locking-postgres"

export default PostgresLockingProvider
export const discoveryPath = require.resolve("@nedusa/locking-postgres")
