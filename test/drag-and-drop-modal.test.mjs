import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MODAL } from '../src/templates/common.js'
import { getBaseCss } from '../src/styles/base.css.js'

const baseSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

test('MODAL renders file-drop-modal with actions for AnyDocs conversion, audio transcription, and 888box upload', () => {
    const zhHtml = MODAL('zh-TW', {})
    assert.match(zhHtml, /class="modal file-drop-modal"/)
    assert.match(zhHtml, /id="file-drop-title"/)
    assert.match(zhHtml, /id="file-drop-action-primary"/)
    assert.match(zhHtml, /id="file-drop-action-tertiary"/)
    assert.match(zhHtml, /id="file-drop-action-secondary"/)
    assert.match(zhHtml, /id="file-drop-action-cancel"/)
    assert.match(zhHtml, /解析為 Markdown 內文/)
    assert.match(zhHtml, /AI 智慧整理排版/)
    assert.match(zhHtml, /上傳至 888box/)

    const enHtml = MODAL('en-US', {})
    assert.match(enHtml, /Process Dropped File/)
    assert.match(enHtml, /Convert to Markdown/)
    assert.match(enHtml, /AI Smart Layout/)
    assert.match(enHtml, /Upload to 888box/)
})

test('CSS includes styles for is-dragover and file-drop-modal with tertiary button', () => {
    const css = getBaseCss()
    assert.match(css, /\.editor-code-shell\.is-dragover/)
    assert.match(css, /\.file-drop-actions/)
    assert.match(css, /\.file-drop-action-primary/)
    assert.match(css, /\.file-drop-action-secondary/)
    assert.match(css, /\.file-drop-action-tertiary/)
})

test('base template routes audio file drop with verbatim timestamps as default and smart format as optional', () => {
    assert.match(baseSource, /AI 轉錄音訊為逐字稿/)
    assert.match(baseSource, /AI 智慧整理排版/)
    assert.match(baseSource, /choice === 'smart'/)
    assert.match(baseSource, /processAudioTranscription\(file, \{\s*smartFormat:\s*false\s*\}\)/)
})
