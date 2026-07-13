import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('share renderer opens Markdown links in a new tab with safe rel attributes', () => {
    assert.match(baseTemplateSource, /body\.classList\.contains\('share-view'\)/)
    assert.match(baseTemplateSource, /querySelectorAll\('a\[href\]'\)/)
    assert.match(baseTemplateSource, /target', '_blank'/)
    assert.match(baseTemplateSource, /rel', 'noopener noreferrer'/)
})
