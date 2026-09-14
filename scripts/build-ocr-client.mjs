import { build } from 'esbuild'

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
