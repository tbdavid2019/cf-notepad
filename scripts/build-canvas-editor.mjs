import { build } from 'esbuild'

await build({
    entryPoints: ['static/js/canvas-editor.jsx'],
    bundle: true,
    format: 'esm',
    target: ['es2022'],
    outfile: 'static/js/canvas-editor.bundle.mjs',
    sourcemap: false,
    minify: true,
    legalComments: 'none',
    conditions: ['style'],
})
