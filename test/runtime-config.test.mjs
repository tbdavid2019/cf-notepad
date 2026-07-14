import test from 'node:test'
import assert from 'node:assert/strict'
import { getSlugLength } from '../src/constant.js'

test('reads the slug length after runtime bindings are injected', () => {
    const previous = globalThis.SCN_SLUG_LENGTH
    globalThis.SCN_SLUG_LENGTH = '4'

    try {
        assert.equal(getSlugLength(), 4)
    } finally {
        if (previous === undefined) delete globalThis.SCN_SLUG_LENGTH
        else globalThis.SCN_SLUG_LENGTH = previous
    }
})
