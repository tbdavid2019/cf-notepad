import test from 'node:test'
import assert from 'node:assert/strict'
import { getBaseCss } from '../src/styles/base.css.js'
import { getEditorCss } from '../src/styles/editor.css.js'

test('mobile split keeps the nested editor textarea tall enough to scroll and type', () => {
    const baseCss = getBaseCss()
    const editorCss = getEditorCss()

    assert.match(baseCss, /body:not\(\.share-view\) \.layer_3\s*\{\s*flex-direction: column !important;/)
    assert.match(editorCss, /body:not\(\.share-view\) \.editor-pane\s*\{[\s\S]*height: 50%;/)
    assert.doesNotMatch(baseCss, /body:not\(\.share-view\) textarea\.contents\s*\{\s*height: 50% !important;/)
})
