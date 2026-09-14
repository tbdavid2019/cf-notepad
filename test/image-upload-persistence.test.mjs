import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('persists the uploaded URL after a pasted image upload completes', () => {
    assert.match(baseTemplateSource, /const uploadImageToR2 = async file =>/)
    assert.match(baseTemplateSource, /fetchJson\('\/upload', \{ method: 'POST', body: formData \}\)/)
    assert.match(baseTemplateSource, /\$textarea\.dispatchEvent\(new Event\('input', \{ bubbles: true \}\)\)/)
})
