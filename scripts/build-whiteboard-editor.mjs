import { build } from 'esbuild'
import { readFileSync, writeFileSync } from 'node:fs'

const outfile = 'static/js/whiteboard-editor.bundle.mjs'

await build({
    entryPoints: ['static/js/whiteboard-editor.jsx'],
    bundle: true,
    format: 'esm',
    target: ['es2022'],
    outfile,
    sourcemap: false,
    minify: true,
    legalComments: 'none',
    conditions: ['production', 'style'],
    loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.ttf': 'dataurl' },
    define: {
        'process.env.NODE_ENV': '"production"',
    },
})

// Excalidraw's browser bundle ships its upstream Firebase client config for
// optional collaboration features. This Worker uses local persistence only;
// remove the upstream public config before the asset enters our repository.
const bundle = readFileSync(outfile, 'utf8')
const sanitizedBundle = bundle.replace(/VITE_APP_FIREBASE_CONFIG:'[^']*'/g, "VITE_APP_FIREBASE_CONFIG:'{}'")
if (sanitizedBundle !== bundle) writeFileSync(outfile, sanitizedBundle)
