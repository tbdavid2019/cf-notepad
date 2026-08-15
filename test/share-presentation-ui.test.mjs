import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const baseCssSource = readFileSync(new URL('../src/styles/base.css.js', import.meta.url), 'utf8')

test('share menu provides both open share link and open presentation link', () => {
    assert.match(commonTemplateSource, /id="share-open-link"/)
    assert.match(commonTemplateSource, /id="share-present-open-link"/)
    assert.match(commonTemplateSource, /href="\$\{shareId \? '\/share\/' \+ encodeURIComponent\(shareId\) \+ '\/present' : '#'\}"/)
})

test('read-only share page footer provides present button to enter fullscreen presentation mode', () => {
    // In common.js read-only block (else if path block):
    assert.match(commonTemplateSource, /id="present-btn" class="toolbar-icon-button"/)
})

test('publishing synchronizes share-present-open-link href dynamically', () => {
    assert.match(baseTemplateSource, /const sharePresentOpenLink = document\.querySelector\('#share-present-open-link'\)/)
    assert.match(baseTemplateSource, /const \$sharePresentOpenLink = document\.querySelector\('#share-present-open-link'\)/)
})

test('presentation uses a bounded 16:9 canvas with an internal safe area', () => {
    assert.match(baseTemplateSource, /width: 1280, height: 720, margin: 0\.035/)
    assert.match(baseCssSource, /--presentation-safe-inline: 76px/)
    assert.match(baseCssSource, /--presentation-safe-top: 64px/)
    assert.match(baseCssSource, /--presentation-safe-bottom: 72px/)
    assert.match(baseCssSource, /#presentation-container \.reveal \.slides \{[\s\S]*border: 1px solid/)
})

test('presentation engine does not leave a production debug log in the console', () => {
    assert.doesNotMatch(baseTemplateSource, /Presentation Engine Loading/)
})

test('presentation preserves readable text and marks content that still overflows', () => {
    assert.match(baseTemplateSource, /var minimumFontSize = 22/)
    assert.match(baseTemplateSource, /presentation-slide-overflow/)
    assert.match(baseTemplateSource, /內容過多，建議拆頁/)
    assert.doesNotMatch(baseTemplateSource, /var minimumFontSize = 13/)
    assert.match(baseCssSource, /section\.presentation-slide-overflow \{[\s\S]*overflow-y: auto/)
})

test('portrait phones receive a landscape presentation hint', () => {
    assert.match(baseTemplateSource, /presentation-orientation-hint/)
    assert.match(baseTemplateSource, /請將裝置旋轉為橫向/)
    assert.match(baseCssSource, /@media \(orientation: portrait\) and \(max-width: 720px\)/)
})

test('presentation engine supports floating toolbar, laser pointer, and export menu', () => {
    assert.match(baseTemplateSource, /presentation-toolbar/)
    assert.match(baseTemplateSource, /id="ptb-overview"/)
    assert.match(baseTemplateSource, /id="ptb-laser"/)
    assert.match(baseTemplateSource, /id="ptb-fullscreen"/)
    assert.match(baseTemplateSource, /id="ptb-export-pdf"/)
    assert.match(baseTemplateSource, /id="ptb-export-slide-png"/)
    assert.match(baseCssSource, /\.presentation-toolbar \{[\s\S]*position: fixed/)
    assert.match(baseCssSource, /#presentation-laser-dot/)
})

test('presentation engine supports KaTeX, Mermaid, ECharts, and Slidev layouts', () => {
    assert.match(baseTemplateSource, /renderMathInElement/)
    assert.match(baseTemplateSource, /language-mermaid/)
    assert.match(baseTemplateSource, /language-echarts/)
    assert.match(baseTemplateSource, /slidev-layout-cover/)
    assert.match(baseTemplateSource, /slidev-layout-three-cols/)
    assert.match(baseTemplateSource, /data-line-numbers/)
    assert.match(baseTemplateSource, /data-presentation-theme/)
    assert.match(baseCssSource, /\.slidev-layout-cover/)
    assert.match(baseCssSource, /\.slidev-layout-three-cols/)
})

test('all script tags in rendered HTML have zero syntax errors', async () => {
    const { HTML } = await import('../src/templates/base.js')
    const html = HTML({
        lang: 'zh-TW',
        title: 'test',
        content: '# Title\n\n---\n\n## Slide 2',
        ext: {},
        tips: '',
        isEdit: false,
        showPwPrompt: false,
        path: 'test',
        shareId: 'test'
    })
    const scripts = html.match(/<script[\s\S]*?<\/script>/g) || []
    assert.ok(scripts.length > 0)
    for (const s of scripts) {
        if (s.includes('text/template') || s.includes('type="module"')) continue
        const code = s.replace(/<script[^>]*>/i, '').replace(/<\/script>$/i, '')
        assert.doesNotThrow(() => {
            new Function(code)
        })
    }
})
