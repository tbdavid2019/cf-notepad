import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MATH_FORMAT_MODAL } from '../src/templates/common.js'
import { HTML } from '../src/templates/base.js'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const commonTemplateSource = readFileSync(new URL('../src/templates/common.js', import.meta.url), 'utf8')
const baseCssSource = readFileSync(new URL('../src/styles/base.css.js', import.meta.url), 'utf8')

test('MATH_FORMAT_MODAL renders all 7 copy formats with applicable scenario descriptions', () => {
    const modalZh = MATH_FORMAT_MODAL('zh-TW')
    assert.match(modalZh, /id="math-format-modal"/)
    assert.match(modalZh, /value="auto"/)
    assert.match(modalZh, /value="latex"/)
    assert.match(modalZh, /value="mathml"/)
    assert.match(modalZh, /value="latex-plain"/)
    assert.match(modalZh, /value="notion"/)
    assert.match(modalZh, /value="png"/)
    assert.match(modalZh, /value="svg"/)
    assert.match(modalZh, /LaTeX 純文字/)
    assert.match(modalZh, /Notion \(雙 \$\)/)
    assert.match(modalZh, /Microsoft Word/)
    assert.match(modalZh, /Desmos/)
    assert.match(modalZh, /Markdown 筆記/)

    const modalEn = MATH_FORMAT_MODAL('en-US')
    assert.match(modalEn, /Formula Copy Format/)
    assert.match(modalEn, /Notion \(\$\$\)/)
    assert.match(modalEn, /MathML \(Word\)/)
    assert.match(modalEn, /Image PNG/)
    assert.match(modalEn, /SVG Vector/)
})

test('FOOTER and base template wire math format trigger button and modal', () => {
    assert.match(commonTemplateSource, /id="math-format-btn"/)
    assert.match(commonTemplateSource, /class="toolbar-icon-button math-format-trigger"/)
    assert.match(baseTemplateSource, /MATH_FORMAT_MODAL\(lang\)/)
    assert.match(baseTemplateSource, /function initMathCopy\(\)/)
    assert.match(baseTemplateSource, /MATH_FORMAT_STORAGE_KEY = 'cf-notepad:math-copy-format'/)
})

test('CSS provides hover, pointer cursor, and copy animation for KaTeX elements', () => {
    assert.match(baseCssSource, /\.katex,\s*\.katex-display\s*\{[^}]*cursor:\s*pointer/)
    assert.match(baseCssSource, /\.katex\.katex-copied,\s*\.katex-display\.katex-copied/)
    assert.match(baseCssSource, /@keyframes katex-copied-pulse/)
})

test('rendered HTML includes math-format modal and client initialization', () => {
    const page = HTML({
        lang: 'zh-TW',
        title: 'Math test',
        content: '$E = mc^2$',
        ext: { share: true },
        tips: [],
        isEdit: false,
        path: 'math-test',
        shareId: 'math-share',
    })

    assert.match(page, /id="math-format-modal"/)
    assert.match(page, /id="math-format-btn"/)
    assert.match(page, /initMathCopy\(\)/)
})
