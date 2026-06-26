import test from 'node:test'
import assert from 'node:assert/strict'

import { summarizeHistoryContent, formatHistoryCharacterCount } from '../src/note_history_presenter.js'

test('summarizeHistoryContent strips leading markdown markers and derives preview', () => {
    const summary = summarizeHistoryContent(`
# Release note

- Added optional history support for editors.
- Keeps the latest ten versions.
`)

    assert.equal(summary.title, 'Release note')
    assert.equal(summary.preview, 'Added optional history support for editors.')
})

test('summarizeHistoryContent falls back safely for plain or empty content', () => {
    assert.deepEqual(summarizeHistoryContent('single line only'), {
        title: 'single line only',
        preview: 'single line only',
    })

    assert.deepEqual(summarizeHistoryContent(''), {
        title: 'Untitled version',
        preview: '',
    })
})

test('formatHistoryCharacterCount counts the full string length', () => {
    assert.equal(formatHistoryCharacterCount('abc\n12'), 6)
})
