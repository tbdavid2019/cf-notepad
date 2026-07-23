import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const helperSource = readFileSync(new URL('../src/helper.js', import.meta.url), 'utf8')

test('returnJSON sends error codes as HTTP errors instead of a status header', () => {
    assert.match(helperSource, /const \{ status: requestedStatus, \.\.\.responseHeaders \} = headers/)
    assert.match(helperSource, /status: responseStatus/)
    assert.match(helperSource, /\.\.\.responseHeaders/)
})

test('returnJSON honors an explicit HTTP status for application error codes', () => {
    assert.match(helperSource, /Number\.isInteger\(requestedStatus\)/)
})
