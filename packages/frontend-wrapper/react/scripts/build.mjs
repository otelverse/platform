import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const external = ['react', '@opentelemetry/api']

async function main() {
  // ESM bundle
  await esbuild.build({
    entryPoints: [path.join(root, 'src/index.ts')],
    bundle: true,
    format: 'esm',
    outfile: path.join(root, 'dist/otelverse-react.js'),
    external,
    sourcemap: true,
    platform: 'browser',
  })

  // IIFE bundle
  await esbuild.build({
    entryPoints: [path.join(root, 'src/index.ts')],
    bundle: true,
    format: 'iife',
    globalName: 'OtelverseReact',
    outfile: path.join(root, 'dist/otelverse-react.iife.js'),
    sourcemap: true,
    platform: 'browser',
  })

  // Minified IIFE
  await esbuild.build({
    entryPoints: [path.join(root, 'src/index.ts')],
    bundle: true,
    format: 'iife',
    globalName: 'OtelverseReact',
    outfile: path.join(root, 'dist/otelverse-react.min.js'),
    sourcemap: true,
    platform: 'browser',
    minify: true,
  })

  console.log('React bundles written to dist/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
