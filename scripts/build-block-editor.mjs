import { build } from 'esbuild'

await build({
    entryPoints: ['static/js/block-editor.mjs'],
    bundle: true,
    format: 'esm',
    target: ['es2022'],
    outfile: 'static/js/block-editor.bundle.mjs',
    sourcemap: false,
    minify: true,
    legalComments: 'none',
})
