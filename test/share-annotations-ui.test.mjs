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
    initShareAnnotations,
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

test('initShareAnnotations auto-discovers share root and mounts all annotation UI components even when called with event object', () => {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="preview-md" class="contents markdown-body"><p>Article text</p></div>
            <div id="share-annotation-root" data-share-id="test-share-123" data-lang="zh-TW"></div>
        </body>
        </html>
    `, { url: 'https://wiki.david888.com/share/test-share-123' })

    const originalDocument = globalThis.document
    const originalWindow = globalThis.window
    const originalFetch = globalThis.fetch
    const originalMutationObserver = globalThis.MutationObserver

    try {
        globalThis.document = dom.window.document
        globalThis.window = dom.window
        globalThis.window.APP_STATE = { shareId: 'test-share-123', lang: 'zh-TW' }
        globalThis.fetch = async () => ({
            ok: true,
            json: async () => ({ err: 0, data: { enabled: true, sourceRevision: 'abc', threads: [] } }),
        })
        globalThis.MutationObserver = class {
            observe() {}
            disconnect() {}
        }

        // Simulate passing a DOM event (e.g. from DOMContentLoaded event listener)
        const mockEvent = { type: 'DOMContentLoaded', target: dom.window.document }
        initShareAnnotations(mockEvent)

        const appRoot = dom.window.document.querySelector('#share-annotation-root')
        assert.ok(appRoot.querySelector('#annotation-rail-button'), 'Rail button should be mounted')
        assert.ok(appRoot.querySelector('.annotation-sidebar'), 'Sidebar should be mounted')
        assert.ok(appRoot.querySelector('.annotation-composer'), 'Composer should be mounted')
        assert.ok(appRoot.querySelector('.selection-action-toolbar'), 'Selection toolbar should be mounted')
        assert.ok(appRoot.querySelector('.selection-ai-popover'), 'AI popover should be mounted')
        assert.ok(appRoot.querySelector('.annotation-mini-popover'), 'Mini popover should be mounted')
    } finally {
        globalThis.document = originalDocument
        globalThis.window = originalWindow
        globalThis.fetch = originalFetch
        globalThis.MutationObserver = originalMutationObserver
    }
})

test('allows consecutive annotations without requiring a full page reload', async () => {
    const revision = 'f'.repeat(64)
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="preview-md" class="contents markdown-body">
                <p id="p1">First paragraph for first note.</p>
                <p id="p2">Second paragraph for second note.</p>
            </div>
            <div id="share-annotation-root" data-share-id="test-share-consecutive" data-lang="zh-TW"></div>
        </body>
        </html>
    `, { url: 'https://wiki.david888.com/share/test-share-consecutive' })

    const originalDocument = globalThis.document
    const originalWindow = globalThis.window
    const originalFetch = globalThis.fetch
    const originalMutationObserver = globalThis.MutationObserver

    try {
        globalThis.document = dom.window.document
        globalThis.window = dom.window
        globalThis.window.APP_STATE = { shareId: 'test-share-consecutive', lang: 'zh-TW' }

        let createdCount = 0
        globalThis.fetch = async (url, options = {}) => {
            if (options.method === 'POST') {
                createdCount += 1
                const body = JSON.parse(options.body)
                return {
                    ok: true,
                    json: async () => ({
                        err: 0,
                        data: {
                            thread: {
                                id: `thread-${createdCount}`,
                                anchor: body.anchor,
                                messages: [{
                                    id: `msg-${createdCount}`,
                                    authorName: body.authorName,
                                    body: body.body,
                                    createdAt: Math.floor(Date.now() / 1000),
                                    deleteToken: `token-${createdCount}`,
                                }],
                                messageCount: 1,
                                createdAt: Math.floor(Date.now() / 1000),
                            },
                        },
                    }),
                }
            }
            return {
                ok: true,
                json: async () => ({
                    err: 0,
                    data: {
                        enabled: true,
                        sourceRevision: revision,
                        threads: [],
                    },
                }),
            }
        }
        globalThis.MutationObserver = class {
            observe() {}
            disconnect() {}
        }

        initShareAnnotations()

        // Wait for initial GET annotations to resolve
        await new Promise(r => setTimeout(r, 50))

        const appRoot = dom.window.document.querySelector('#share-annotation-root')
        const selectionToolbar = appRoot.querySelector('.selection-action-toolbar')
        const selectionButton = appRoot.querySelector('.annotation-selection-button')
        const composer = appRoot.querySelector('.annotation-composer')
        const quoteEl = composer.querySelector('.annotation-composer-quote')
        const authorInput = composer.querySelector('input[name="authorName"]')
        const bodyInput = composer.querySelector('textarea[name="body"]')

        // Step 1: Select text in first paragraph
        const p1 = dom.window.document.querySelector('#p1').firstChild
        const range1 = dom.window.document.createRange()
        range1.setStart(p1, 0)
        range1.setEnd(p1, 15) // "First paragraph"
        range1.getBoundingClientRect = () => ({ left: 100, top: 100, width: 80, height: 20 })

        const selection = dom.window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range1)

        dom.window.document.dispatchEvent(new dom.window.Event('selectionchange'))
        await new Promise(r => setTimeout(r, 100))

        assert.equal(selectionToolbar.hidden, false, 'Toolbar should be visible on 1st selection')
        assert.equal(selectionButton.hidden, false, 'Annotation button should be visible on 1st selection')

        // Click annotate button
        selectionButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
        assert.equal(composer.hidden, false, 'Composer should be visible')
        assert.match(quoteEl.textContent, /First paragraph/)

        // Fill and submit 1st annotation
        authorInput.value = 'UserA'
        bodyInput.value = 'Comment on paragraph 1'
        composer.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
        await new Promise(r => setTimeout(r, 50))

        assert.equal(createdCount, 1, 'First annotation created')
        assert.equal(composer.hidden, true, 'Composer should be hidden after submit')

        // Step 2: Consecutive annotation on second paragraph without reload
        const p2 = dom.window.document.querySelector('#p2').firstChild
        const range2 = dom.window.document.createRange()
        range2.setStart(p2, 0)
        range2.setEnd(p2, 16) // "Second paragraph"
        range2.getBoundingClientRect = () => ({ left: 100, top: 200, width: 80, height: 20 })

        selection.removeAllRanges()
        selection.addRange(range2)

        dom.window.document.dispatchEvent(new dom.window.Event('selectionchange'))
        await new Promise(r => setTimeout(r, 100))

        assert.equal(selectionToolbar.hidden, false, 'Toolbar should be visible on 2nd selection')
        assert.equal(selectionButton.hidden, false, 'Annotation button MUST NOT be hidden on consecutive selection')

        // Click annotate button for 2nd note
        selectionButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
        assert.equal(composer.hidden, false, 'Composer should be visible for 2nd annotation')
        assert.match(quoteEl.textContent, /Second paragraph/)

        // Fill and submit 2nd annotation
        authorInput.value = 'UserA'
        bodyInput.value = 'Comment on paragraph 2'
        composer.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
        await new Promise(r => setTimeout(r, 50))

        assert.equal(createdCount, 2, 'Second consecutive annotation created successfully')

        // Verify thread card structure
        const threadCards = dom.window.document.querySelectorAll('.annotation-thread')
        assert.equal(threadCards.length, 2, 'Two thread cards rendered')
        for (const card of threadCards) {
            assert.ok(card.querySelector('.annotation-quote-box'), 'Card contains quote box')
            assert.ok(card.querySelector('.annotation-quote-badge'), 'Card contains quote badge')
            assert.ok(card.querySelector('.annotation-thread-quote'), 'Card contains quote text')
            assert.ok(card.querySelector('.annotation-discussion-section'), 'Card contains discussion section')
            assert.ok(card.querySelector('.annotation-author-avatar'), 'Message contains author avatar')
            assert.ok(card.querySelector('.annotation-author-name'), 'Message contains author name')
            assert.ok(card.querySelector('.annotation-reply-btn'), 'Card contains reply button')
        }
    } finally {
        globalThis.document = originalDocument
        globalThis.window = originalWindow
        globalThis.fetch = originalFetch
        globalThis.MutationObserver = originalMutationObserver
    }
})
