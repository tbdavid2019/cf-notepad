import { build } from 'esbuild'

await build({
    entryPoints: ['static/js/whiteboard-editor.jsx'],
    bundle: true,
    format: 'esm',
    target: ['es2022'],
    outfile: 'static/js/whiteboard-editor.bundle.mjs',
    sourcemap: false,
    minify: true,
    legalComments: 'none',
    conditions: ['production', 'style'],
    loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.ttf': 'dataurl' },
    define: {
        'process.env.NODE_ENV': '"production"',
    },
})
