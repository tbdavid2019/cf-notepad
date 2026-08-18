import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

import {
    buildSelectionAnchor,
    createAnnotationThreadUrl,
    getAnnotationThreadIdFromHash,
    getStoredDeleteToken,
    getStoredDeleteTokens,
    isPointInAnnotationRange,
    locateAnchorRange,
    removeStoredDeleteToken,
    setupAnnotationRailDragging,
    scrollRangeIntoView,
    storeDeleteToken,
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

test('annotation rail defaults to top right to avoid blocking bottom controls', () => {
    assert.match(
        annotationCss,
        /\.annotation-rail-button\s*\{[^}]*inset-block-start:\s*16px;/,
    )
})

test('annotation css hides rail button and popovers during print', () => {
    assert.match(annotationCss, /@media print \{/)
    assert.match(annotationCss, /\.annotation-rail-button,/)
})

test('annotation rail can be dragged and restores its saved viewport-relative position', () => {
    const dom = new JSDOM('<!doctype html><button class="annotation-rail-button"></button>', {
        url: 'https://example.test/share/demo',
    })
    const rail = dom.window.document.querySelector('.annotation-rail-button')
    Object.defineProperties(dom.window, {
        innerWidth: { value: 1000, configurable: true },
        innerHeight: { value: 800, configurable: true },
    })
    rail.getBoundingClientRect = () => ({ left: 900, top: 200, width: 70, height: 42 })

    setupAnnotationRailDragging(rail, {
        storageKey: 'annotation-rail-test',
        windowRef: dom.window,
    })

    const pointer = (type, x, y) => {
        const event = new dom.window.MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y })
        Object.defineProperty(event, 'pointerId', { value: 1 })
        return event
    }
    rail.dispatchEvent(pointer('pointerdown', 920, 220))
    dom.window.dispatchEvent(pointer('pointermove', 800, 600))
    dom.window.dispatchEvent(pointer('pointerup', 800, 600))

    assert.equal(rail.style.left, '780px')
    assert.equal(rail.style.top, '580px')
    assert.match(dom.window.localStorage.getItem('annotation-rail-test'), /"leftRatio"/)

    const restored = dom.window.document.createElement('button')
    restored.getBoundingClientRect = () => ({ width: 70, height: 42 })
    setupAnnotationRailDragging(restored, {
        storageKey: 'annotation-rail-test',
        windowRef: dom.window,
    })
    assert.equal(restored.style.left, '780px')
    assert.equal(restored.style.top, '580px')
})

test('annotation links keep the share URL while removing password query values', () => {
    const url = createAnnotationThreadUrl(
        'https://example.test/share/demo?pw=private&view=compact#old-section',
        'thread/with spaces',
    )

    assert.equal(
        url,
        'https://example.test/share/demo?view=compact#annotation=thread%2Fwith%20spaces',
    )
    assert.equal(getAnnotationThreadIdFromHash('#annotation=thread%2Fwith%20spaces'), 'thread/with spaces')
    assert.equal(getAnnotationThreadIdFromHash('#section-1'), null)
})

test('annotation cards expose a copyable deep link and handle it when the URL changes', () => {
    assert.match(annotationCss, /\.annotation-copy-link-button/)
    assert.match(
        readFileSync(new URL('../static/js/share-annotations.mjs', import.meta.url), 'utf8'),
        /window\.addEventListener\('hashchange', locateThreadFromLocation\)/,
    )
})

test('selection floating toolbar and inline AI popover components are rendered with multi-action buttons', () => {
    const shareJsSource = readFileSync(new URL('../static/js/share-annotations.mjs', import.meta.url), 'utf8')
    assert.match(shareJsSource, /selection-action-toolbar/)
    assert.match(shareJsSource, /selection-action-copy/)
    assert.match(shareJsSource, /selection-action-translate/)
    assert.match(shareJsSource, /selection-action-ask-ai/)
    assert.match(shareJsSource, /selection-action-annotate/)
    assert.match(shareJsSource, /selection-ai-popover/)
    assert.match(shareJsSource, /selection-ai-presets/)
    assert.match(shareJsSource, /selection-ai-ask-form/)
    assert.match(shareJsSource, /selection-ai-copy-result-btn/)

    assert.match(annotationCss, /\.selection-action-toolbar/)
    assert.match(annotationCss, /\.selection-action-btn/)
    assert.match(annotationCss, /\.selection-ai-popover/)
    assert.match(annotationCss, /\.selection-ai-chip/)
})

test('isPointInAnnotationRange accurately checks if coordinates fall inside range client rects', () => {
    assert.equal(isPointInAnnotationRange(null, 100, 100), false)
    assert.equal(isPointInAnnotationRange({}, 100, 100), false)

    const mockRange = {
        getClientRects: () => [
            { left: 50, right: 150, top: 100, bottom: 120, width: 100, height: 20 },
            { left: 50, right: 200, top: 125, bottom: 145, width: 150, height: 20 },
        ],
    }

    // Inside first line
    assert.equal(isPointInAnnotationRange(mockRange, 100, 110), true)
    // Inside second line
    assert.equal(isPointInAnnotationRange(mockRange, 180, 130), true)
    // Within 3px buffer boundary
    assert.equal(isPointInAnnotationRange(mockRange, 48, 110, 3), true)
    assert.equal(isPointInAnnotationRange(mockRange, 100, 98, 3), true)
    // Outside
    assert.equal(isPointInAnnotationRange(mockRange, 10, 10), false)
    assert.equal(isPointInAnnotationRange(mockRange, 190, 110), false)
    assert.equal(isPointInAnnotationRange(mockRange, 100, 200), false)
})

test('annotation mini popover components, hover preview, and thread flash styles are defined', () => {
    const shareJsSource = readFileSync(new URL('../static/js/share-annotations.mjs', import.meta.url), 'utf8')
    assert.match(shareJsSource, /annotation-mini-popover/)
    assert.match(shareJsSource, /annotation-mini-header/)
    assert.match(shareJsSource, /annotation-mini-badge/)
    assert.match(shareJsSource, /annotation-mini-count/)
    assert.match(shareJsSource, /annotation-mini-author/)
    assert.match(shareJsSource, /annotation-mini-time/)
    assert.match(shareJsSource, /annotation-mini-body/)
    assert.match(shareJsSource, /annotation-mini-footer/)
    assert.match(shareJsSource, /annotation-mini-action-text/)
    assert.match(shareJsSource, /annotation-thread-flash/)
    assert.match(shareJsSource, /showMiniPopover/)
    assert.match(shareJsSource, /hideMiniPopover/)
    assert.match(shareJsSource, /findThreadAtPoint/)
    assert.match(shareJsSource, /focusThreadInSidebar/)

    assert.match(annotationCss, /\.annotation-mini-popover/)
    assert.match(annotationCss, /\.annotation-mini-badge/)
    assert.match(annotationCss, /\.annotation-mini-author/)
    assert.match(annotationCss, /\.annotation-mini-body/)
    assert.match(annotationCss, /\.annotation-mini-action-text/)
    assert.match(annotationCss, /\.annotation-thread-flash/)
    assert.match(annotationCss, /@media print \{[\s\S]*\.annotation-mini-popover/)
})

test('annotation delete token storage helpers manage local tokens in localStorage', () => {
    const originalLocalStorage = globalThis.localStorage
    const store = new Map()
    globalThis.localStorage = {
        getItem: key => store.get(key) || null,
        setItem: (key, val) => store.set(key, String(val)),
        removeItem: key => store.delete(key),
    }

    try {
        assert.deepEqual(getStoredDeleteTokens(), {})
        assert.equal(getStoredDeleteToken('msg-1'), '')

        storeDeleteToken('msg-1', 'token-abc')
        assert.equal(getStoredDeleteToken('msg-1'), 'token-abc')
        assert.deepEqual(getStoredDeleteTokens(), { 'msg-1': 'token-abc' })

        storeDeleteToken('msg-2', 'token-def')
        assert.equal(getStoredDeleteToken('msg-2'), 'token-def')

        removeStoredDeleteToken('msg-1')
        assert.equal(getStoredDeleteToken('msg-1'), '')
        assert.equal(getStoredDeleteToken('msg-2'), 'token-def')
    } finally {
        globalThis.localStorage = originalLocalStorage
    }
})

test('annotation delete button styles and DOM handlers are defined in JS and CSS', () => {
    const shareJsSource = readFileSync(new URL('../static/js/share-annotations.mjs', import.meta.url), 'utf8')
    assert.match(shareJsSource, /annotation-delete-message-btn/)
    assert.match(shareJsSource, /DELETE/)
    assert.match(shareJsSource, /X-Annotation-Delete-Token/)
    assert.match(shareJsSource, /removeStoredDeleteToken/)
    assert.match(shareJsSource, /confirmDelete/)

    assert.match(annotationCss, /\.annotation-delete-message-btn/)
    assert.match(annotationCss, /\.annotation-message-meta-actions/)
})
