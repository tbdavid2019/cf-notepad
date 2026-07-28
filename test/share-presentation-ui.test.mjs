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
