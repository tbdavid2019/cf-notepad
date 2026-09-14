import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'

import { normalizeOcrItems, ocrItemsToText, insertTextAtSelection, reconstructTableFromOcrBoxes } from '../static/js/ocr-utils.mjs'
import { extractTableMarkdown, toUserFacingOcrError } from '../static/js/ocr-client.mjs'
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

test('prefers tableMarkdown and extracts only a contiguous GFM table', () => {
    const payload = {
        data: {
            markdown: '# title\n\n| noisy | fallback |\n| --- | --- |\n| no | no |\n\nFooter',
            tableMarkdown: '| A | B |\n| :--- | ---: |\n| 甲 | 乙 |\n\n![image](https://example.com/image.png)',
        },
    }
    assert.equal(extractTableMarkdown(payload), '| A | B |\n| :--- | ---: |\n| 甲 | 乙 |')
    assert.equal(extractTableMarkdown({ data: { markdown: '| A | B |\n| --- | --- |\n| 甲 | 乙 |\n\nFooter' } }), '| A | B |\n| --- | --- |\n| 甲 | 乙 |')
    assert.equal(extractTableMarkdown({ data: { tableMarkdown: '| A | B |\n| --- | --- |\n| <script>alert(1)</script> | safe |' } }), '| A | B |\n| --- | --- |\n| &lt;script&gt;alert(1)&lt;/script&gt; | safe |')
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
    assert.match(zh, /後端表格 OCR 會將圖片送至/)
    assert.match(zh, /辨識表格/)
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
    assert.match(ocrClientSource, /recognizeTableImage/)
    assert.match(ocrClientSource, /recognizeRemoteTableImage/)
    assert.match(ocrClientSource, /reconstructTableFromOcrBoxes/)
    assert.match(ocrClientSource, /mode=table/)
    assert.match(ocrClientSource, /tableMarkdown/)
    assert.match(readFileSync(new URL('../scripts/build-ocr-client.mjs', import.meta.url), 'utf8'), /worker-entry/)
    const workerAssetName = readdirSync(new URL('../static/js/assets', import.meta.url)).find(name => /^worker-entry-[^/]+\.js$/.test(name))
    assert.ok(workerAssetName)
    assert.equal(existsSync(new URL('../static/js/assets/' + workerAssetName, import.meta.url)), true)
    assert.doesNotMatch(readFileSync(new URL('../static/js/assets/' + workerAssetName, import.meta.url), 'utf8'), /sourceMappingURL/)
    assert.match(blockEditorSource, /window\.__insertBlockEditorImage/)
    assert.match(blockEditorSource, /handleImagePaste/)
})

test('reconstructTableFromOcrBoxes accurately builds 2D GFM Markdown table from OCR bounding boxes', () => {
    const items = [
        { text: '項目', box: { x: 10, y: 10, width: 40, height: 20 } },
        { text: '數量', box: { x: 80, y: 10, width: 40, height: 20 } },
        { text: '金額|元', box: { x: 150, y: 10, width: 50, height: 20 } },
        { text: '蘋果', box: { x: 10, y: 40, width: 40, height: 20 } },
        { text: '5', box: { x: 80, y: 40, width: 20, height: 20 } },
        { text: '100', box: { x: 150, y: 40, width: 30, height: 20 } },
        { text: '香蕉', box: { x: 10, y: 70, width: 40, height: 20 } },
        { text: '2', box: { x: 80, y: 70, width: 20, height: 20 } },
        { text: '60', box: { x: 150, y: 70, width: 30, height: 20 } },
    ]

    const result = reconstructTableFromOcrBoxes(items)
    assert.equal(result.isTable, true)
    assert.equal(result.rowCount, 3)
    assert.equal(result.colCount, 3)
    assert.equal(
        result.markdown,
        '| 項目 | 數量 | 金額\\|元 |\n| --- | --- | --- |\n| 蘋果 | 5 | 100 |\n| 香蕉 | 2 | 60 |'
    )
})

test('reconstructTableFromOcrBoxes works with poly coordinates and merges close horizontal tokens', () => {
    const items = [
        { text: '產品', poly: [[10, 10], [40, 10], [40, 30], [10, 30]] },
        { text: '價格', poly: [[80, 10], [120, 10], [120, 30], [80, 30]] },
        { text: '雲端', poly: [[10, 40], [30, 40], [30, 60], [10, 60]] },
        { text: '主機', poly: [[32, 40], [50, 40], [50, 60], [32, 60]] },
        { text: '$99', poly: [[80, 40], [110, 40], [110, 60], [80, 60]] },
    ]

    const result = reconstructTableFromOcrBoxes(items)
    assert.equal(result.isTable, true)
    assert.equal(result.rowCount, 2)
    assert.equal(result.colCount, 2)
    assert.equal(
        result.markdown,
        '| 產品 | 價格 |\n| --- | --- |\n| 雲端 主機 | $99 |'
    )
})

test('table paste uses the text after the selection instead of an undeclared variable', () => {
    assert.match(baseSource, /var after = \$textarea\.value\.substring\(endPos\)/)
    assert.doesNotMatch(baseSource, /var suffixNewline = \(after\.length > 0[\s\S]{0,100}var after/)
})
