import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('persists the uploaded URL after a pasted image upload completes', () => {
    const successBranch = baseTemplateSource.match(
        /if \(res\.err === 0\) \{([\s\S]*?)\} else \{/
    )?.[1] || ''

    assert.match(successBranch, /\$textarea\.dispatchEvent\(new Event\('input', \{ bubbles: true \}\)\)/)
})
