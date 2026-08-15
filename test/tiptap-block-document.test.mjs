import test from 'node:test'
import assert from 'node:assert/strict'
import {
    createTiptapBlockDocument,
    isTiptapBlockDocument,
    legacyBlockDocumentToTiptapDocument,
    normalizeTiptapBlockDocument,
} from '../src/block_document.mjs'
import { blockNoteToTiptapDocument, tiptapToBlockNoteDocument } from '../src/blocknote_document.mjs'

test('converts the existing fixed block format into a Tiptap document without dropping media blocks', () => {
    const document = legacyBlockDocumentToTiptapDocument({
        version: 1,
        blocks: [
            { id: 'title', type: 'heading', props: { level: 2, text: 'Roadmap' } },
            { id: 'image', type: 'image', props: { src: 'https://cdn.example/image.png', alt: 'Cover' } },
            { id: 'slide', type: 'slideBreak', props: {} },
        ],
    })

    assert.equal(document.type, 'doc')
    assert.deepEqual(document.content[0], { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Roadmap' }] })
    assert.deepEqual(document.content[1], { type: 'david888Embed', attrs: { kind: 'image', src: 'https://cdn.example/image.png', alt: 'Cover' } })
    assert.deepEqual(document.content[2], { type: 'david888Embed', attrs: { kind: 'slideBreak' } })
})

test('normalizes an empty document into a valid editable Tiptap paragraph', () => {
    const document = normalizeTiptapBlockDocument(createTiptapBlockDocument())

    assert.equal(isTiptapBlockDocument(document), true)
    assert.deepEqual(document.content, [{ type: 'paragraph' }])
})

test('round-trips native BlockNote tables without flattening their cells', () => {
    const table = {
        type: 'table',
        content: {
            type: 'tableContent',
            columnWidths: [180, undefined],
            headerRows: 1,
            rows: [
                { cells: [
                    { type: 'tableCell', props: { textAlignment: 'left' }, content: [{ type: 'text', text: '名稱', styles: { bold: true } }] },
                    { type: 'tableCell', props: { textAlignment: 'right' }, content: [{ type: 'text', text: '數量', styles: {} }] },
                ] },
                { cells: [
                    { type: 'tableCell', props: {}, content: [{ type: 'text', text: '鉛筆', styles: {} }] },
                    { type: 'tableCell', props: { colspan: 2, backgroundColor: 'blue' }, content: [{ type: 'text', text: '12', styles: {} }] },
                ] },
            ],
        },
    }

    const persisted = blockNoteToTiptapDocument([table])
    assert.equal(persisted.content[0].type, 'table')
    assert.equal(persisted.content[0].content[0].content[0].type, 'tableHeader')
    assert.equal(persisted.content[0].content[1].content[1].attrs.colspan, 2)

    const restored = tiptapToBlockNoteDocument(persisted)[0]
    assert.equal(restored.type, 'table')
    assert.equal(restored.content.headerRows, 1)
    assert.equal(restored.content.rows[0].cells[0].content[0].text, '名稱')
    assert.equal(restored.content.rows[1].cells[1].props.colspan, 2)
    assert.equal(restored.content.rows[1].cells[1].props.backgroundColor, 'blue')
})
