/**
 * Injection tokens for the config module.
 *
 * Upstream resolves configuration from the awilix container by the string key
 * `ContainerRegistrationKeys.CONFIG_MODULE` ("configModule"). Nest uses its own token
 * registry, so the bridge is one provider registered under both: this symbol for new
 * Nest code, and the legacy string for anything still calling `container.resolve`
 * through ContainerCompat during the migration.
 */
export const NEDUSA_CONFIG = Symbol.for("nedusa:config")

/** The string key upstream registers config under. Kept for the compatibility bridge. */
export const LEGACY_CONFIG_KEY = "configModule"
