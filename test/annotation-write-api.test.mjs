import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')

test('annotation write routes create threads and replies with same-origin protection', () => {
    assert.match(indexSource, /router\.post\('\/api\/shares\/:shareId\/annotations'/)
    assert.match(indexSource, /router\.post\('\/api\/shares\/:shareId\/annotations\/:threadId\/messages'/)
    assert.match(indexSource, /request\.headers\.get\('Origin'\)/)
    assert.match(indexSource, /Annotation write origin rejected/)
    assert.match(indexSource, /validateAnnotationDraft/)
    assert.match(indexSource, /createAnnotationThread/)
    assert.match(indexSource, /addAnnotationMessage/)
})

test('annotation writes require an enabled shared note and preserve view-password access', () => {
    assert.match(indexSource, /metadata\.share !== true/)
    assert.match(indexSource, /metadata\.annotationsEnabled !== true/)
    assert.match(indexSource, /checkAuth\(cookie, path\)/)
    assert.match(indexSource, /Share password required/)
})

test('new threads reject a stale source revision', () => {
    assert.match(indexSource, /computeSourceRevision\(value\)/)
    assert.match(indexSource, /Source revision changed/)
    assert.match(indexSource, /status:\s*409/)
})
