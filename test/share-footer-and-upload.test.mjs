import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FOOTER } from '../src/templates/common.js'

const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseCssSource = readFileSync(new URL('../src/styles/base.css.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const toolbarSource = readFileSync(new URL('../static/js/markdown-toolbar.mjs', import.meta.url), 'utf8')

test('appearance selectors use width and theme dropdowns', () => {
    assert.match(commonTemplateSource, /id="width-dropdown"/)
    assert.match(commonTemplateSource, /id="theme-dropdown"/)
    assert.match(commonTemplateSource, /class="dropdown-menu width-dropdown-menu"/)
    assert.match(commonTemplateSource, /class="dropdown-menu theme-dropdown-menu"/)
    assert.match(commonTemplateSource, /data-width-value="\$\{opt\.value\}"/)
    assert.match(baseTemplateSource, /webawesome\.css/)
    assert.match(baseTemplateSource, /webawesome\.loader\.js/)
    assert.match(baseTemplateSource, /item\.dataset\.widthValue/)
    assert.match(baseCssSource, /\.width-dropdown/)
    assert.match(baseCssSource, /\.theme-dropdown/)
})

test('share font and language controls use the same aligned toggle group', () => {
    assert.match(commonTemplateSource, /class="footer-control-group footer-toggle-control-group"[\s\S]*id="share-font-selector"/)
    assert.match(commonTemplateSource, /class="footer-control-group footer-toggle-control-group"[\s\S]*id="language-selector"/)
    assert.match(baseCssSource, /\.footer-toggle-control-group\s*\{[\s\S]*height:\s*var\(--toolbar-height\)/)
    assert.match(baseCssSource, /#language-selector\s*,\s*#share-font-selector\s*\{[\s\S]*display:\s*inline-flex[\s\S]*align-items:\s*center/)
})

test('attachment uploads prefer david888 box and fall back in order', () => {
    const endpoints = [...toolbarSource.matchAll(/https:\/\/box\.[^']+\/api\.php\?action=upload/g)].map(match => match[0])
    assert.deepEqual(endpoints, [
        'https://box.david888.com/api.php?action=upload',
        'https://box.aiurl.tw/api.php?action=upload',
        'https://box.glsoft.ai/api.php?action=upload',
    ])
    assert.match(toolbarSource, /for\s*\(const endpoint of BOX_UPLOAD_ENDPOINTS\)/)
})

test('share footer displays the D1 view count and omits it when unavailable', () => {
    const sharedFooter = FOOTER({
        lang: 'zh-TW',
        isEdit: false,
        mode: 'md',
        sharePath: '/share/abc123',
        viewCount: 42,
    })
    const unavailableFooter = FOOTER({
        lang: 'zh-TW',
        isEdit: false,
        mode: 'md',
        sharePath: '/share/abc123',
        viewCount: null,
    })

    assert.match(sharedFooter, /id="share-view-count"/)
    assert.match(sharedFooter, /42 次瀏覽/)
    assert.doesNotMatch(unavailableFooter, /id="share-view-count"/)
})

test('share footer provides recent shares history and groups dark mode toggle inside appearance section', () => {
    const sharedFooter = FOOTER({
        lang: 'zh-TW',
        isEdit: false,
        mode: 'md',
        path: 'abc123',
        sharePath: '/share/abc123',
        shareId: 'abc123',
    })

    assert.match(sharedFooter, /id="share-history-btn"/)
    assert.match(sharedFooter, /class="footer-section footer-section-appearance"[\s\S]*id="ui-theme-toggle-btn"[\s\S]*class="footer-section footer-section-info"/)
    assert.doesNotMatch(sharedFooter, /class="footer-section footer-section-info"[\s\S]*id="ui-theme-toggle-btn"/)
})
