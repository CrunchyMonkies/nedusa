# ADR-009: Upstream's HTTP contract is frozen as nedusa's specification

**Status:** accepted · **Date:** 2026-09-23 · **Phase:** all

## Context

nedusa rewrites Medusa's HTTP layer from file-based express routes onto NestJS
controllers. A rewrite of 330 route files is impossible to verify by inspection, and the
fork must additionally absorb an upstream release every 2–3 weeks.

Separately, Medusa's request model has no natural NestJS equivalent. `validateAndTransformQuery`
is not a validator: it writes six request fields (`validatedQuery`, `filterableFields`,
`queryConfig`, `remoteQueryConfig`, `listConfig`, `retrieveConfig`) and reads several more
while applying allowed/disallowed/restricted/RBAC field filtering. There are 750
references to `req.scope` across the route handlers.

## Decision

Upstream's HTTP contract — routes, payloads, status codes — is **frozen as the
specification**. Where NestJS idioms and Medusa's shapes conflict, **Medusa wins**.

Any deviation from the contract is a bug, not a design choice, for the duration of the
port.

## Rationale

Freezing the contract converts verification from a judgement call into a mechanical gate:

- Upstream's 207 integration specs (~1,813 cases) remain a valid conformance harness.
  They assert over HTTP with axios against a real port — supertest appears in zero of
  them — so they are transport-agnostic and run unchanged.
- Route-table parity and OpenAPI diff become **build gates**. Route precedence drift in
  particular is silent, and a parity check is the only thing that sees it.
- The admin dashboard (466 files consuming generated `HttpTypes`) and `@medusajs/js-sdk`
  keep working with no coordinated change.

Without the freeze, none of those hold, and a 12–18 month port would proceed with no
objective measure of whether it is still correct.

## Consequences

- Awkward parts of Medusa's API cannot be cleaned up during the port. They can be
  revisited afterwards, deliberately and with a migration path.
- Some NestJS features are unavailable by construction. Handlers keep `@Req()`/`@Res()`,
  which puts Nest in library-specific mode and rules out return-value serialization,
  `@HttpCode` and `ClassSerializerInterceptor`. In practice nothing is lost: every
  upstream handler already writes `res.json(...)` imperatively.
- Request-augmentation behaviour must be reproduced rather than redesigned, including
  `queryConfig` and `filterableFields`.

## Note

The freeze applies to the **wire contract**, not to internals. Module structure, DI,
workflow execution and the build system all change freely — they are not observable to a
client.
