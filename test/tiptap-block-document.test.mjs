import test from 'node:test'
import assert from 'node:assert/strict'
import {
    createTiptapBlockDocument,
    isTiptapBlockDocument,
    legacyBlockDocumentToTiptapDocument,
    normalizeTiptapBlockDocument,
} from '../src/block_document.mjs'

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
