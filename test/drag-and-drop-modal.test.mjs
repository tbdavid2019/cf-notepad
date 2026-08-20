import test from 'node:test'
import assert from 'node:assert/strict'
import { MODAL } from '../src/templates/common.js'
import { getBaseCss } from '../src/styles/base.css.js'

test('MODAL renders file-drop-modal with actions for AnyDocs conversion and 888box upload', () => {
    const zhHtml = MODAL('zh-TW', {})
    assert.match(zhHtml, /class="modal file-drop-modal"/)
    assert.match(zhHtml, /id="file-drop-title"/)
    assert.match(zhHtml, /id="file-drop-action-primary"/)
    assert.match(zhHtml, /id="file-drop-action-secondary"/)
    assert.match(zhHtml, /id="file-drop-action-cancel"/)
    assert.match(zhHtml, /解析為 Markdown 內文/)
    assert.match(zhHtml, /上傳至 888box/)

    const enHtml = MODAL('en-US', {})
    assert.match(enHtml, /Process Dropped File/)
    assert.match(enHtml, /Convert to Markdown/)
    assert.match(enHtml, /Upload to 888box/)
})

test('CSS includes styles for is-dragover and file-drop-modal', () => {
    const css = getBaseCss()
    assert.match(css, /\.editor-code-shell\.is-dragover/)
    assert.match(css, /\.file-drop-actions/)
    assert.match(css, /\.file-drop-action-primary/)
    assert.match(css, /\.file-drop-action-secondary/)
})
