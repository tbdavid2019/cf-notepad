import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

import { getReadingProgress, initReadingProgress } from '../static/js/reading-progress.mjs'

const baseTemplate = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const baseCss = readFileSync(new URL('../src/styles/base.css.js', import.meta.url), 'utf8')

test('calculates reading progress from a scroll container', () => {
    assert.deepEqual(getReadingProgress({ scrollTop: 125, scrollHeight: 1000, clientHeight: 500 }), {
        percent: 25,
        maxScroll: 500,
        isScrollable: true,
    })
    assert.deepEqual(getReadingProgress({ scrollTop: 0, scrollHeight: 400, clientHeight: 500 }), {
        percent: 0,
        maxScroll: 0,
        isScrollable: false,
    })
})

test('loads a reading progress widget for rendered Markdown pages', () => {
    assert.match(baseTemplate, /src="\/js\/reading-progress\.mjs"/)
    assert.match(baseCss, /\.reading-progress/)
    assert.match(baseCss, /\.reading-progress-track/)
})

test('uses GenJyuu Gothic for Chinese while preserving the existing Latin font stack', () => {
    assert.match(baseCss, /font-family: "GenJyuu Gothic CJK"/)
    assert.match(baseCss, /GenJyuuGothic-Medium\.woff2/)
    assert.match(baseCss, /unicode-range:/)
    assert.match(baseCss, /--editor-font-family: "GenJyuu Gothic CJK", "Maple Mono"/)
})

test('keeps the editor preview on the CJK-aware font stack after a theme is applied', () => {
    assert.match(baseTemplate, /body:not\(\.share-view\) #preview-md\.markdown-body,[\s\S]*font-family: var\(--editor-font-family\);/)
    assert.match(baseTemplate, /body:not\(\.share-view\) #preview-md\.markdown-body :is\([\s\S]*font-family: var\(--editor-font-family\);/)
})

test('updates the rendered reading progress widget as the preview scrolls', () => {
    const dom = new JSDOM('<html lang="zh-Hant-TW"><body><div class="preview-pane"><div id="preview-md"></div></div></body></html>')
    const preview = dom.window.document.querySelector('#preview-md')
    Object.defineProperties(preview, {
        clientHeight: { value: 500 },
        scrollHeight: { value: 1000 },
    })

    assert.equal(initReadingProgress(dom.window.document), true)
    assert.equal(dom.window.document.querySelector('.reading-progress-value').textContent, '0%')

    preview.scrollTop = 250
    preview.dispatchEvent(new dom.window.Event('scroll'))
    assert.equal(dom.window.document.querySelector('.reading-progress-value').textContent, '50%')
})
