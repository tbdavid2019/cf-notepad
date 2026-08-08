import test from 'node:test'
import assert from 'node:assert/strict'
import { blockNoteToTiptapDocument, tiptapToBlockNoteDocument } from '../src/blocknote_document.mjs'

test('existing Tiptap block documents load into BlockNote without dropping formatted text or embeds', () => {
    const source = {
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title', marks: [{ type: 'bold' }] }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Read ' }, { type: 'text', text: 'this', marks: [{ type: 'link', attrs: { href: 'https://example.test' } }] }] },
            { type: 'david888Embed', attrs: { kind: 'mermaid', source: 'flowchart LR\nA-->B' } },
        ],
    }

    const blocks = tiptapToBlockNoteDocument(source)
    assert.equal(blocks[0].type, 'heading')
    assert.equal(blocks[0].props.level, 2)
    assert.equal(blocks[0].content[0].styles.bold, true)
    assert.equal(blocks[1].content[1].type, 'link')
    assert.equal(blocks[2].type, 'davidEmbed')
    assert.equal(blocks[2].props.kind, 'mermaid')
})

test('BlockNote edits serialize back to the existing server-rendered Tiptap block format', () => {
    const document = blockNoteToTiptapDocument([
        { type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Hello', styles: { italic: true } }] },
        { type: 'bulletListItem', content: 'One' },
        { type: 'bulletListItem', content: 'Two' },
        { type: 'davidEmbed', props: { kind: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Video' } },
    ])

    assert.equal(document.type, 'doc')
    assert.equal(document.content[0].type, 'heading')
    assert.equal(document.content[0].content[0].marks[0].type, 'italic')
    assert.equal(document.content[1].type, 'bulletList')
    assert.equal(document.content[1].content.length, 2)
    assert.equal(document.content[2].type, 'david888Embed')
    assert.equal(document.content[2].attrs.kind, 'youtube')
})

test('legacy block JSON remains accepted through the existing Tiptap compatibility conversion', () => {
    const blocks = tiptapToBlockNoteDocument({
        version: 1,
        blocks: [{ type: 'paragraph', props: { text: 'Legacy note' } }, { type: 'image', props: { src: 'https://example.test/image.png', alt: 'Image' } }],
    })

    assert.equal(blocks[0].type, 'paragraph')
    assert.equal(blocks[0].content[0].text, 'Legacy note')
    assert.equal(blocks[1].type, 'davidEmbed')
    assert.equal(blocks[1].props.kind, 'image')
})
