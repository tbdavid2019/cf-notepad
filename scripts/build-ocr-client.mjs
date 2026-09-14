import { build } from 'esbuild'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

await build({
    entryPoints: ['static/js/paddleocr-runtime.mjs'],
    bundle: true,
    platform: 'browser',
    external: ['fs', 'path'],
    format: 'esm',
    target: ['es2022'],
    outfile: 'static/js/paddleocr-runtime.bundle.mjs',
    sourcemap: false,
    minify: true,
    legalComments: 'none',
})

const paddleOcrAssetDir = resolve('node_modules/@paddleocr/paddleocr-js/dist/assets')
const workerAsset = readdirSync(paddleOcrAssetDir).find(name => /^worker-entry-[^/]+\.js$/.test(name))
if (!workerAsset) throw new Error('PaddleOCR.js worker asset was not found.')

const targetWorkerPath = resolve('static/js/assets', workerAsset)
mkdirSync(dirname(targetWorkerPath), { recursive: true })
const workerSource = readFileSync(resolve(paddleOcrAssetDir, workerAsset), 'utf8')
    .replace(/\r?\n\/\/#[ ]?sourceMappingURL=[^\r\n]+/, '')
writeFileSync(targetWorkerPath, workerSource)
