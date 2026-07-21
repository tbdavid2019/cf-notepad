import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseCssSource = readFileSync(new URL('../src/styles/base.css.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const toolbarSource = readFileSync(new URL('../static/js/markdown-toolbar.mjs', import.meta.url), 'utf8')

test('appearance selectors use Web Awesome custom elements', () => {
    assert.match(commonTemplateSource, /<wa-select id="preview-width-selector"/)
    assert.match(commonTemplateSource, /<wa-select id="theme-selector"/)
    assert.match(commonTemplateSource, /<wa-select id="preview-width-selector"[^>]*size="s"/)
    assert.match(commonTemplateSource, /<wa-select id="theme-selector"[^>]*size="s"/)
    assert.match(commonTemplateSource, /<wa-option value="1200px"/)
    assert.match(commonTemplateSource, /<wa-option value="\$\{themeName\}"/)
    assert.match(baseTemplateSource, /webawesome\.css/)
    assert.match(baseTemplateSource, /webawesome\.loader\.js/)
    assert.match(baseTemplateSource, /previewWidthSelector\.addEventListener\('change'/)
    assert.match(baseCssSource, /\.footer-select::part\(listbox\)/)
    assert.match(baseCssSource, /width:\s*min\(360px,\s*calc\(100vw - 16px\)\)/)
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
