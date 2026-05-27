import * as esbuild from 'esbuild'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const external = [
  '@opentelemetry/api',
  '@opentelemetry/sdk-trace-web',
  '@opentelemetry/sdk-metrics',
  '@opentelemetry/exporter-trace-otlp-http',
  '@opentelemetry/exporter-metrics-otlp-http',
  '@opentelemetry/instrumentation',
  '@opentelemetry/instrumentation-document-load',
  '@opentelemetry/instrumentation-fetch',
  '@opentelemetry/instrumentation-xml-http-request',
  '@opentelemetry/resources',
  '@opentelemetry/semantic-conventions',
  'web-vitals',
]

async function main() {
  // ESM bundle (externalized deps - for bundlers)
  await esbuild.build({
    entryPoints: [path.join(root, 'src/index.ts')],
    bundle: true,
    format: 'esm',
    outfile: path.join(root, 'dist/otelverse-web.js'),
    external,
    sourcemap: true,
    platform: 'browser',
  })

  // IIFE bundle (self-contained, global name OtelverseWeb)
  await esbuild.build({
    entryPoints: [path.join(root, 'src/index.ts')],
    bundle: true,
    format: 'iife',
    globalName: 'OtelverseWeb',
    outfile: path.join(root, 'dist/otelverse-web.iife.js'),
    sourcemap: true,
    platform: 'browser',
  })

  // Minified IIFE
  await esbuild.build({
    entryPoints: [path.join(root, 'src/index.ts')],
    bundle: true,
    format: 'iife',
    globalName: 'OtelverseWeb',
    outfile: path.join(root, 'dist/otelverse-web.min.js'),
    sourcemap: true,
    platform: 'browser',
    minify: true,
  })

  console.log('Bundles written to dist/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
