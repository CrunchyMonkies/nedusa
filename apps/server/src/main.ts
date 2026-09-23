import "reflect-metadata"

import { NestFactory } from "@nestjs/core"
import type { NestExpressApplication } from "@nestjs/platform-express"

import { AppModule } from "./app.module.js"

export async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Medusa's body parsing is per-route and config-driven
    // (createBodyParserMiddlewaresStack in @nedusa/framework): a `sizeLimit` on 11 routes
    // and `preserveRawBody` on the payment webhook. Nest's global json/urlencoded would
    // consume the body first and those routes would never see the raw stream.
    bodyParser: false,
  })

  // Upstream sets this in the express loader; it governs how req.ip and X-Forwarded-*
  // are interpreted behind a proxy.
  app.set("trust proxy", 1)

  return app
}

async function main(): Promise<void> {
  const app = await bootstrap()
  const port = Number(process.env.PORT ?? 9000)
  const host = process.env.HOST ?? "0.0.0.0"
  await app.listen(port, host)
  console.log(`nedusa server listening on http://${host}:${port}`)
}

// ESM has no `require.main`; compare the entry URL instead.
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
