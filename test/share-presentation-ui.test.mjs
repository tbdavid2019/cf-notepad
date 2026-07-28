import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')

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
