import test from 'node:test'
import assert from 'node:assert/strict'

import { getEditorViewShortcut } from '../static/js/editor-view-shortcuts.mjs'

test('maps macOS view shortcuts to editor modes and layouts', () => {
    assert.deepEqual(getEditorViewShortcut({ key: '7', metaKey: true, altKey: true }), {
        mode: 'md',
        splitDirection: 'horizontal',
    })
    assert.deepEqual(getEditorViewShortcut({ key: '8', metaKey: true, altKey: true }), { mode: 'plain' })
    assert.deepEqual(getEditorViewShortcut({ key: '9', metaKey: true, altKey: true }), {
        mode: 'md',
        splitDirection: 'vertical',
    })
})

test('accepts Ctrl-Alt and ignores incomplete or modified shortcuts', () => {
    assert.deepEqual(getEditorViewShortcut({ key: '7', ctrlKey: true, altKey: true }), {
        mode: 'md',
        splitDirection: 'horizontal',
    })
    assert.equal(getEditorViewShortcut({ key: '7', ctrlKey: true }), null)
    assert.equal(getEditorViewShortcut({ key: '7', altKey: true }), null)
    assert.equal(getEditorViewShortcut({ key: '7', metaKey: true, altKey: true, shiftKey: true }), null)
    assert.equal(getEditorViewShortcut({ key: '6', metaKey: true, altKey: true }), null)
})
