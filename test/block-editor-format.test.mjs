import test from 'node:test'
import assert from 'node:assert/strict'
import { parseBlockDocument, renderBlockToHtml, blockToMarkdown } from '../src/block_renderer.mjs'
import { resolveEditorFormat, extractNoteTitle, extractNoteDescription } from '../src/note_meta.js'

test('resolveEditorFormat returns block when metadata.editorFormat is block', () => {
    assert.equal(resolveEditorFormat({ editorFormat: 'block' }), 'block')
    assert.equal(resolveEditorFormat({ editorFormat: 'markdown' }), 'markdown')
    assert.equal(resolveEditorFormat({}), 'markdown')
})

test('parseBlockDocument parses valid block JSON and falls back gracefully', () => {
    const json = JSON.stringify({
        version: 1,
        blocks: [
            { id: 'b1', type: 'paragraph', props: { text: 'Hello Block' } },
        ],
    })
    const doc = parseBlockDocument(json)
    assert.equal(doc.blocks.length, 1)
    assert.equal(doc.blocks[0].props.text, 'Hello Block')

    const fallback = parseBlockDocument('Plain text fallback')
    assert.equal(fallback.blocks.length, 1)
    assert.equal(fallback.blocks[0].props.text, 'Plain text fallback')
})

test('renderBlockToHtml renders all core block types safely', () => {
    const doc = {
        version: 1,
        blocks: [
            { id: 'h1', type: 'heading', props: { level: 1, text: 'Block Title' } },
            { id: 'p1', type: 'paragraph', props: { text: 'Paragraph text' } },
            { id: 'b1', type: 'bulletList', props: { text: 'Bullet item 1' } },
            { id: 't1', type: 'taskList', props: { text: 'Task item 1', checked: true } },
            { id: 'c1', type: 'code', props: { language: 'js', text: 'console.log("hi")' } },
            { id: 'q1', type: 'quote', props: { text: 'A quote' } },
            { id: 'd1', type: 'divider' },
            { id: 's1', type: 'slideBreak' },
            { id: 'img1', type: 'image', props: { src: 'https://example.com/a.png', alt: 'Demo' } },
            { id: 'yt1', type: 'youtube', props: { videoId: 'dQw4w9WgXcQ', title: 'Rickroll' } },
            { id: 'pdf1', type: 'pdf', props: { url: 'https://example.com/doc.pdf', title: 'PDF' } },
            { id: 'mm1', type: 'mermaid', props: { source: 'graph TD; A-->B;' } },
            { id: 'ec1', type: 'echarts', props: { optionJson: '{"title":{"text":"Demo"}}' } },
            { id: 'f1', type: 'file', props: { url: 'https://example.com/audio.mp3', mimeType: 'audio/mp3' } },
        ],
    }

    const html = renderBlockToHtml(doc)

    assert.match(html, /<h1 data-block-id="h1">Block Title<\/h1>/)
    assert.match(html, /<p data-block-id="p1">Paragraph text<\/p>/)
    assert.match(html, /<ul class="block-bullet-list">\s*<li data-block-id="b1">Bullet item 1<\/li>\s*<\/ul>/)
    assert.match(html, /<input type="checkbox" class="task-list-item-checkbox" checked disabled>/)
    assert.match(html, /<pre data-block-id="c1"><code class="language-js">console\.log\(&quot;hi&quot;\)<\/code><\/pre>/)
    assert.match(html, /<blockquote data-block-id="q1"><p>A quote<\/p><\/blockquote>/)
    assert.match(html, /<hr data-block-id="d1">/)
    assert.match(html, /<hr class="slide-break" data-block-id="s1" data-slide-break="true">/)
    assert.match(html, /<img src="https:\/\/example\.com\/a\.png" alt="Demo">/)
    assert.match(html, /https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/)
    assert.match(html, /iframe src="https:\/\/example\.com\/doc\.pdf"/)
    assert.match(html, /class="mermaid"/)
    assert.match(html, /class="echarts"/)
    assert.match(html, /<audio controls src="https:\/\/example\.com\/audio\.mp3"><\/audio>/)
})

test('blockToMarkdown converts block document to valid Markdown', () => {
    const doc = {
        version: 1,
        blocks: [
            { id: 'h1', type: 'heading', props: { level: 2, text: 'Sub Heading' } },
            { id: 'p1', type: 'paragraph', props: { text: 'Paragraph content' } },
            { id: 'c1', type: 'code', props: { language: 'python', text: 'print("hello")' } },
            { id: 's1', type: 'slideBreak' },
        ],
    }

    const md = blockToMarkdown(doc)
    assert.match(md, /## Sub Heading/)
    assert.match(md, /Paragraph content/)
    assert.match(md, /```python\nprint\("hello"\)\n```/)
    assert.match(md, /---/)
})

test('extractNoteTitle and extractNoteDescription handle block JSON documents', () => {
    const json = JSON.stringify({
        version: 1,
        blocks: [
            { id: 'h1', type: 'heading', props: { level: 1, text: 'Block Article Title' } },
            { id: 'p1', type: 'paragraph', props: { text: 'First paragraph text' } },
        ],
    })

    const title = extractNoteTitle(json)
    assert.equal(title, 'Block Article Title')

    const desc = extractNoteDescription(json)
    assert.match(desc, /Block Article Title First paragraph text/)
})
