import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'

import { normalizeOcrItems, ocrItemsToText, insertTextAtSelection } from '../static/js/ocr-utils.mjs'
import { toUserFacingOcrError } from '../static/js/ocr-client.mjs'
import { MODAL } from '../src/templates/common.js'
import { HTML } from '../src/templates/base.js'

const baseSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const blockEditorSource = readFileSync(new URL('../static/js/blocknote-editor.jsx', import.meta.url), 'utf8')
const ocrClientSource = readFileSync(new URL('../static/js/ocr-client.mjs', import.meta.url), 'utf8')

test('normalizes OCR items in geometric reading order and skips empty results', () => {
    const items = normalizeOcrItems([
        { text: '第二行', score: 0.9, poly: [[10, 50], [80, 50], [80, 70], [10, 70]] },
        { text: '  ', score: 0.2, poly: [[0, 0], [1, 0], [1, 1], [0, 1]] },
        { text: '右側', score: 0.8, poly: [[100, 10], [140, 10], [140, 28], [100, 28]] },
        { text: '左側', score: 0.95, poly: [[10, 10], [50, 10], [50, 28], [10, 28]] },
    ])

    assert.deepEqual(items.map(item => item.text), ['左側', '右側', '第二行'])
    assert.equal(ocrItemsToText(items), '左側\n右側\n第二行')
})

test('maps OCR runtime failures to actionable localized-safe messages', () => {
    assert.match(toUserFacingOcrError(new Error('Failed to construct Worker')), /Worker/)
    assert.match(toUserFacingOcrError(new Error('WebGPU adapter unavailable')), /WebGPU/)
    assert.match(toUserFacingOcrError(new Error('Failed to download model: HTTP 503')), /模型下載/)
})

test('inserts OCR text at the current selection with document-safe separation', () => {
    assert.deepEqual(insertTextAtSelection('前文', '辨識內容', 2, 2), {
        text: '前文\n\n辨識內容',
        selectionStart: 8,
        selectionEnd: 8,
    })
    assert.deepEqual(insertTextAtSelection('原本內容\n後文', '新內容', 0, 4), {
        text: '新內容\n\n後文',
        selectionStart: 4,
        selectionEnd: 4,
    })
})

test('renders bilingual image processing choices', () => {
    const zh = MODAL('zh-TW', {})
    const en = MODAL('en-US', {})
    assert.match(zh, /class="modal image-ocr-modal"/)
    assert.match(zh, /上傳圖片/)
    assert.match(zh, /OCR 轉文字/)
    assert.match(zh, /本機 OCR 不會上傳圖片/)
    assert.match(zh, /id="ocr-status"/)
    assert.match(en, /Process Image/)
    assert.match(en, /Upload image/)
    assert.match(en, /Run local OCR/)
})

test('edit pages load the local OCR client and expose both image actions', () => {
    const html = HTML({
        lang: 'zh-TW',
        title: 'OCR test',
        content: '',
        path: 'ocr-test',
        isEdit: true,
        ext: { enableR2: true, editorFormat: 'markdown' },
    })
    assert.match(html, /src="\/js\/ocr-client\.mjs"/)
    assert.match(baseSource, /choice === 'ocr'/)
    assert.match(baseSource, /choice === 'upload'/)
    assert.match(baseSource, /window\.cfNotepadOcr\.recognizeImage/)
    assert.match(ocrClientSource, /ocrVersion: 'PP-OCRv6'/)
    assert.match(ocrClientSource, /backend: 'auto'/)
    assert.match(ocrClientSource, /getStatus/)
    assert.match(readFileSync(new URL('../scripts/build-ocr-client.mjs', import.meta.url), 'utf8'), /worker-entry/)
    const workerAssetName = readdirSync(new URL('../static/js/assets', import.meta.url)).find(name => /^worker-entry-[^/]+\.js$/.test(name))
    assert.ok(workerAssetName)
    assert.equal(existsSync(new URL('../static/js/assets/' + workerAssetName, import.meta.url)), true)
    assert.doesNotMatch(readFileSync(new URL('../static/js/assets/' + workerAssetName, import.meta.url), 'utf8'), /sourceMappingURL/)
    assert.match(blockEditorSource, /window\.__insertBlockEditorImage/)
    assert.match(blockEditorSource, /handleImagePaste/)
})

test('table paste uses the text after the selection instead of an undeclared variable', () => {
    assert.match(baseSource, /var after = \$textarea\.value\.substring\(endPos\)/)
    assert.doesNotMatch(baseSource, /var suffixNewline = \(after\.length > 0[\s\S]{0,100}var after/)
})
