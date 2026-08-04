import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

test('block editor is shipped as a locally bundled Tiptap module', () => {
    const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

    assert.equal(packageJson.dependencies['@tiptap/core'], '^3.29.2')
    assert.equal(packageJson.dependencies['@tiptap/starter-kit'], '^3.29.2')
    assert.equal(packageJson.devDependencies.esbuild, '^0.28.1')
    assert.equal(packageJson.scripts['build:block-editor'], 'node scripts/build-block-editor.mjs')
    assert.match(packageJson.scripts.pretest, /build:block-editor/)
    assert.match(packageJson.scripts.predeploy, /build:block-editor/)
    assert.equal(existsSync(new URL('../static/js/block-editor.bundle.mjs', import.meta.url)), true)
})
