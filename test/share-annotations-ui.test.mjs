import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

import {
    buildSelectionAnchor,
    locateAnchorRange,
    scrollRangeIntoView,
} from '../static/js/share-annotations.mjs'

const baseTemplateSource = readFileSync(new URL('../src/templates/base.js', import.meta.url), 'utf8')
const annotationCss = readFileSync(new URL('../static/css/share-annotations.css', import.meta.url), 'utf8')

test('share pages load annotation UI only when the author enabled annotations', () => {
    assert.match(baseTemplateSource, /resolveAnnotationsEnabled\(ext\)/)
    assert.match(baseTemplateSource, /id="share-annotation-root"/)
    assert.match(baseTemplateSource, /\/js\/share-annotations\.mjs/)
    assert.match(baseTemplateSource, /\/css\/share-annotations\.css/)
})

test('selected rendered text becomes a stable text-quote anchor', () => {
    const dom = new JSDOM('<main id="article"><p>Alpha <strong>selected</strong> paragraph.</p></main>')
    const article = dom.window.document.querySelector('#article')
    const selectedText = article.querySelector('strong').firstChild
    const range = dom.window.document.createRange()
    range.setStart(selectedText, 0)
    range.setEnd(selectedText, selectedText.data.length)

    assert.deepEqual(buildSelectionAnchor(article, range, 'a'.repeat(64)), {
        exact: 'selected',
        prefix: 'Alpha ',
        suffix: ' paragraph.',
        startOffset: 6,
        endOffset: 14,
        sourceRevision: 'a'.repeat(64),
    })
})

test('anchors reattach by quote context and become detached when source text disappears', () => {
    const dom = new JSDOM('<main id="article"><p>New intro. Alpha selected paragraph.</p></main>')
    const article = dom.window.document.querySelector('#article')
    const anchor = {
        exact: 'selected',
        prefix: 'Alpha ',
        suffix: ' paragraph.',
        startOffset: 6,
        endOffset: 14,
        sourceRevision: 'a'.repeat(64),
    }

    assert.equal(
        locateAnchorRange(article, anchor, 'b'.repeat(64)).toString(),
        'selected',
    )

    article.textContent = 'The original sentence was removed.'
    assert.equal(locateAnchorRange(article, anchor, 'b'.repeat(64)), null)
})

test('locating an annotation scrolls the article container to center the exact range', () => {
    let scrollOptions
    const scrollRoot = {
        clientHeight: 600,
        scrollTop: 100,
        getBoundingClientRect: () => ({ top: 0, height: 600 }),
        scrollTo: options => {
            scrollOptions = options
        },
    }
    const range = {
        getBoundingClientRect: () => ({ top: 900, height: 20 }),
    }

    assert.equal(scrollRangeIntoView(range, scrollRoot), true)
    assert.deepEqual(scrollOptions, {
        top: 710,
        behavior: 'smooth',
    })
})

test('annotation sidebar supports responsive layout and visible keyboard focus', () => {
    assert.match(annotationCss, /\.annotation-sidebar/)
    assert.match(annotationCss, /@media \(max-width: 720px\)/)
    assert.match(annotationCss, /:focus-visible/)
    assert.match(annotationCss, /::highlight\(share-annotations\)/)
})
