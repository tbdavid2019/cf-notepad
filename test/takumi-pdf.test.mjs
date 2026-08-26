import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { renderMarkdownToPdf, createPdfResponse, buildPdfDocumentHtml } from '../src/pdf_service.mjs'
import { EXPORT_DROPDOWN_MENU } from '../src/templates/common.js'

const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
const baseSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const mcpSource = readFileSync(new URL('../src/mcp_server.mjs', import.meta.url), 'utf8')

test('pdf_service renders markdown with Chinese, emojis, code and generates valid PDF binary', async () => {
    const md = '# 測試標題\n\n這是一篇 **Takumi-PDF** 測試文章，包含 🚀 emoji 與表格：\n\n| 項目 | 說明 |\n| :--- | :--- |\n| 1 | 繁體中文向量排版 |\n\n```js\nconst ok = true;\n```'
    const pdfBytes = await renderMarkdownToPdf(md, {
        title: '繁體中文測試',
        author: 'David888',
        size: 'a4',
    })

    assert.ok(pdfBytes instanceof Uint8Array)
    assert.ok(pdfBytes.length > 1000)

    // Check PDF magic header %PDF-
    const header = String.fromCharCode(...pdfBytes.slice(0, 5))
    assert.equal(header, '%PDF-')
})

test('createPdfResponse produces RFC 5987 UTF-8 safe Content-Disposition headers', () => {
    const fakeBytes = new Uint8Array([37, 80, 68, 70, 45])
    const resp = createPdfResponse(fakeBytes, '測試報告.pdf')

    assert.equal(resp.status, 200)
    assert.equal(resp.headers.get('Content-Type'), 'application/pdf')
    const disposition = resp.headers.get('Content-Disposition')
    assert.ok(disposition)
    assert.match(disposition, /attachment; filename=".*"; filename\*=UTF-8''%E6%B8%AC%E8%A9%A6%E5%A0%B1%E5%91%8A\.pdf/)
})

test('buildPdfDocumentHtml produces styled wrapper with document title', () => {
    const html = buildPdfDocumentHtml('<p>Hello World</p>', { title: 'Test Document' })
    assert.match(html, /Test Document/)
    assert.match(html, /font-family/)
    assert.match(html, /Hello World/)
})

test('index.js registers Takumi-PDF routes for direct, note, and share exports', () => {
    assert.match(indexSource, /\/api\/pdf\/export/)
    assert.match(indexSource, /\/api\/markdown\/pdf/)
    assert.match(indexSource, /\/:path\/export\/pdf/)
    assert.match(indexSource, /\/share\/:shareId\/export\/pdf/)
    assert.match(indexSource, /handleDirectPdfExport/)
    assert.match(indexSource, /handleNotePdfExport/)
    assert.match(indexSource, /handleSharePdfExport/)
})

test('base.js exports direct vector PDF via /api/pdf/export with print preview fallback', () => {
    assert.match(baseSource, /handleDirectPdfDownload/)
    assert.match(baseSource, /\/api\/pdf\/export/)
    assert.match(baseSource, /getExportMarkdown/)
    assert.match(baseSource, /exportPdfBtn\.addEventListener\('click', handleDirectPdfDownload\)/)
})

test('EXPORT_DROPDOWN_MENU renders both Direct PDF Export and Browser Print buttons', () => {
    const htmlZh = EXPORT_DROPDOWN_MENU('zh-TW')
    const domZh = new JSDOM(htmlZh)
    const docZh = domZh.window.document

    const pdfBtn = docZh.querySelector('#export-pdf-btn')
    const printBtn = docZh.querySelector('#print-preview-btn')

    assert.ok(pdfBtn)
    assert.ok(printBtn)
    assert.match(pdfBtn.textContent, /直接導出 PDF/)
    assert.match(printBtn.textContent, /瀏覽器列印預覽/)
})

test('mcp_server defines and handles export_pdf tool', () => {
    assert.match(mcpSource, /name:\s*'export_pdf'/)
    assert.match(mcpSource, /case 'export_pdf':/)
    assert.match(mcpSource, /renderMarkdownToPdf/)
})
