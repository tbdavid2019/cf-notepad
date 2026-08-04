import test from 'node:test'
import assert from 'node:assert/strict'
import { parseBlockDocument, renderBlockToHtml, blockToMarkdown, validateBlockDocument } from '../src/block_renderer.mjs'
import { resolveEditorFormat, resolveLockedEditorFormat, extractNoteTitle, extractNoteDescription } from '../src/note_meta.js'

test('resolveEditorFormat returns block when metadata.editorFormat is block', () => {
    assert.equal(resolveEditorFormat({ editorFormat: 'block' }), 'block')
    assert.equal(resolveEditorFormat({ editorFormat: 'markdown' }), 'markdown')
    assert.equal(resolveEditorFormat({}), 'markdown')
})

test('resolveLockedEditorFormat prevents a note format from changing after creation', () => {
    assert.equal(resolveLockedEditorFormat({}, 'block'), 'block')
    assert.equal(resolveLockedEditorFormat({ editorFormat: 'markdown' }), 'markdown')
    assert.equal(resolveLockedEditorFormat({ editorFormat: 'block' }, 'block'), 'block')
    assert.throws(() => resolveLockedEditorFormat({ editorFormat: 'block' }, 'markdown'), /immutable/)
    assert.throws(() => resolveLockedEditorFormat({}, 'html'), /Invalid editor format/)
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

test('block documents reject malformed blocks at write boundaries and render safely at read boundaries', () => {
    assert.throws(() => validateBlockDocument({ version: 1, blocks: [null] }), /Invalid block/)
    assert.throws(() => parseBlockDocument('{"version":1,"blocks":[null]}', { allowTextFallback: false }), /Invalid block/)
    assert.doesNotThrow(() => renderBlockToHtml({ version: 1, blocks: [null] }))
    assert.equal(renderBlockToHtml({ version: 1, blocks: [null] }), '<p></p>')
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

test('raw blocks are escaped in HTML and preserved as an explicit HTML code fence in Markdown', () => {
    const doc = {
        version: 1,
        blocks: [{ id: 'raw', type: 'raw', props: { content: '<img src=x onerror=alert(1)>' } }],
    }

    const html = renderBlockToHtml(doc)
    assert.doesNotMatch(html, /<img src=x/)
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
    assert.match(blockToMarkdown(doc), /```html\n<img src=x onerror=alert\(1\)>\n```/)
})

test('block media renderers allow only http and https URLs', () => {
    const html = renderBlockToHtml({
        version: 1,
        blocks: [
            { type: 'image', props: { src: 'javascript:alert(1)' } },
            { type: 'pdf', props: { url: 'data:text/html,boom' } },
            { type: 'file', props: { url: 'javascript:alert(2)', name: 'bad' } },
        ],
    })

    assert.doesNotMatch(html, /javascript:|data:text\/html/)
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

test('block title extraction skips non-textual and list blocks before a heading or paragraph', () => {
    const json = JSON.stringify({
        version: 1,
        blocks: [
            { id: 'list', type: 'bulletList', props: { text: 'Not the title' } },
            { id: 'h1', type: 'heading', props: { text: 'Actual title' } },
        ],
    })

    assert.equal(extractNoteTitle(json), 'Actual title')
})
