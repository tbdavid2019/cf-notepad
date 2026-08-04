import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { HTML } from '../src/templates/base.js'

test('block edit pages use a WYSIWYG block canvas instead of the Markdown split preview', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'Block note',
        content: '{"version":1,"blocks":[]}',
        isEdit: true,
        ext: { editorFormat: 'block', blockHtml: '<p></p>' },
        path: 'block-note',
    })

    assert.match(page, /id="block-editor"/)
    assert.match(page, /id="contents" class="contents hide"/)
    assert.doesNotMatch(page, /data-markdown-toolbar/)
    assert.doesNotMatch(page, /class="divide-line"/)
    assert.doesNotMatch(page, /id="import-md-btn"/)
    assert.doesNotMatch(page, /data-rail-checked-value="md"/)
    assert.match(page, /\/js\/block-editor\.bundle\.mjs/)
    assert.doesNotMatch(page, /\/js\/block-view\.mjs/)
})

test('block editor exposes structural blocks and both existing upload paths', () => {
    const source = readFileSync(new URL('../static/js/block-editor.mjs', import.meta.url), 'utf8')
    assert.match(source, /slideBreak/)
    assert.match(source, /mermaid/)
    assert.match(source, /echarts/)
    assert.match(source, /\/upload/)
    assert.match(source, /box\.david888\.com\/api\.php\?action=upload/)
})

test('shared block pages load dedicated Mermaid and ECharts enhancement only when needed', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'Block share',
        content: '{"version":1,"blocks":[]}',
        isEdit: false,
        ext: { editorFormat: 'block', blockHtml: '<p>Shared block</p>' },
        shareId: 'share-id',
    })
    const source = readFileSync(new URL('../static/js/block-view.mjs', import.meta.url), 'utf8')
    assert.match(page, /<div id="preview-md" class="contents markdown-body"><p>Shared block<\/p><\/div>/)
    assert.match(page, /\/js\/block-view\.mjs/)
    assert.match(source, /mermaid@11/)
    assert.match(source, /renderEchartsChart/)
})
