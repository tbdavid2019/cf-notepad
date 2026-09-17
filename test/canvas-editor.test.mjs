import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
    parseCanvasDocument,
    validateCanvasDocument,
    canvasToMarkdown,
    DEFAULT_CANVAS_NODES,
    DEFAULT_CANVAS_EDGES,
} from '../src/canvas_document.mjs'
import {
    resolveEditorFormat,
    resolveLockedEditorFormat,
    extractNoteTitle,
    extractNoteDescription,
} from '../src/note_meta.js'
import { HTML } from '../src/templates/base.js'
import { FOOTER, SVG_ICONS } from '../src/templates/common.js'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const indexSource = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')

test('parseCanvasDocument returns default template when input is empty or invalid', () => {
    const emptyDoc = parseCanvasDocument('')
    assert.equal(emptyDoc.nodes.length, DEFAULT_CANVAS_NODES.length)
    assert.equal(emptyDoc.edges.length, DEFAULT_CANVAS_EDGES.length)

    const invalidDoc = parseCanvasDocument('not a json')
    assert.equal(invalidDoc.nodes.length, DEFAULT_CANVAS_NODES.length)
})

test('parseCanvasDocument and validateCanvasDocument handle valid JSON Canvas documents', () => {
    const validJson = JSON.stringify({
        nodes: [
            { id: '1', type: 'text', x: 10, y: 20, width: 200, height: 100, text: 'Card 1' },
            { id: '2', type: 'sticky', x: 250, y: 20, width: 200, height: 100, text: 'Sticky note', color: '#fff9c4' },
        ],
        edges: [
            { id: 'e1', fromNode: '1', toNode: '2', label: 'relates to' },
        ],
    })

    const parsed = parseCanvasDocument(validJson)
    assert.equal(parsed.nodes.length, 2)
    assert.equal(parsed.edges.length, 1)
    assert.equal(parsed.nodes[0].text, 'Card 1')
    assert.equal(parsed.edges[0].label, 'relates to')
    assert.doesNotThrow(() => validateCanvasDocument(parsed))

    assert.throws(() => validateCanvasDocument(null), /Canvas document must be an object/)
    assert.throws(() => validateCanvasDocument({ nodes: 'invalid', edges: [] }), /nodes must be an array/)
    assert.throws(() => validateCanvasDocument({ nodes: [], edges: 'invalid' }), /edges must be an array/)
})

test('canvasToMarkdown extracts readable markdown representation from canvas nodes', () => {
    const doc = {
        nodes: [
            { id: '1', type: 'text', text: '## First Section\nSome content' },
            { id: '2', type: 'file', file: 'my-other-note', text: 'Related reading' },
        ],
        edges: [],
    }

    const md = canvasToMarkdown(doc)
    assert.match(md, /## First Section/)
    assert.match(md, /Some content/)
    assert.match(md, /\[Note: my-other-note\]/)
})

test('note_meta resolves canvas format and enforces format immutability', () => {
    assert.equal(resolveEditorFormat({ editorFormat: 'canvas' }), 'canvas')
    assert.equal(resolveLockedEditorFormat({}, 'canvas'), 'canvas')
    assert.equal(resolveLockedEditorFormat({ editorFormat: 'canvas' }, 'canvas'), 'canvas')
    assert.throws(() => resolveLockedEditorFormat({ editorFormat: 'canvas' }, 'markdown'), /immutable/)
    assert.throws(() => resolveLockedEditorFormat({ editorFormat: 'markdown' }, 'canvas'), /immutable/)
    assert.throws(() => resolveLockedEditorFormat({ editorFormat: 'block' }, 'canvas'), /immutable/)
})

test('extractNoteTitle and extractNoteDescription extract content from JSON Canvas', () => {
    const canvasJson = JSON.stringify({
        nodes: [
            { id: 'n1', type: 'text', text: '# 系統架構總覽\n這是詳細的架構說明...' },
            { id: 'n2', type: 'sticky', text: '臨時提醒事項' },
        ],
        edges: [],
    })

    const title = extractNoteTitle(canvasJson)
    assert.equal(title, '系統架構總覽')

    const desc = extractNoteDescription(canvasJson)
    assert.match(desc, /系統架構總覽/)
    assert.match(desc, /這是詳細的架構說明/)
})

test('FOOTER renders new canvas note link and canvas SVG icon', () => {
    const footerHtml = FOOTER({ lang: 'zh-TW', isEdit: true, editorFormat: 'canvas' })
    assert.match(footerHtml, /id="new-canvas-note-link"/)
    assert.match(footerHtml, /href="\/new\/canvas"/)
    assert.match(footerHtml, /無限畫布/)
    assert.ok(SVG_ICONS.canvas)
})

test('index.js registers /new/canvas route and canvas page ext', () => {
    assert.match(indexSource, /router\.get\('\/new\/canvas',/)
    assert.match(indexSource, /editorFormat === 'canvas'/)
})

test('base template renders canvas editor container and loads bundle when editorFormat is canvas', () => {
    const html = HTML({
        lang: 'zh-TW',
        title: 'Canvas Test',
        content: JSON.stringify({ nodes: [], edges: [] }),
        ext: { editorFormat: 'canvas' },
        isEdit: true,
        path: 'test-canvas-note',
    })

    assert.match(html, /id="canvas-editor"/)
    assert.match(html, /class="editor-pane canvas-editor-pane"/)
    assert.match(html, /href="\/js\/canvas-editor\.bundle\.css"/)
    assert.match(html, /src="\/js\/canvas-editor\.bundle\.mjs"/)
    assert.match(html, /data-editable="true"/)
})

test('base template renders read-only canvas editor container when not in edit mode', () => {
    const html = HTML({
        lang: 'zh-TW',
        title: 'Canvas View',
        content: JSON.stringify({ nodes: [], edges: [] }),
        ext: { editorFormat: 'canvas' },
        isEdit: false,
        path: 'test-canvas-note',
    })

    assert.match(html, /id="canvas-editor"/)
    assert.match(html, /data-editable="false"/)
    assert.match(html, /src="\/js\/canvas-editor\.bundle\.mjs"/)
})
