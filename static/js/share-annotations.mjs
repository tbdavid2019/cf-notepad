const MAX_QUOTE_LENGTH = 1000
const CONTEXT_LENGTH = 160
const AUTHOR_STORAGE_KEY = 'cf-notepad:annotation-author'
const RAIL_POSITION_STORAGE_PREFIX = 'cf-notepad:annotation-rail-position:'
const RAIL_VIEWPORT_PADDING = 8

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), Math.max(minimum, maximum))

const getRailDimensions = rail => {
    const rect = rail.getBoundingClientRect()
    return {
        width: rect.width || rail.offsetWidth || 42,
        height: rect.height || rail.offsetHeight || 42,
    }
}

const getViewportDimensions = windowRef => ({
    width: windowRef.innerWidth || windowRef.document?.documentElement?.clientWidth || 0,
    height: windowRef.innerHeight || windowRef.document?.documentElement?.clientHeight || 0,
})

const applyRailPosition = (rail, left, top) => {
    rail.style.left = `${Math.round(left)}px`
    rail.style.top = `${Math.round(top)}px`
    rail.style.right = 'auto'
    rail.style.bottom = 'auto'
    rail.style.transform = 'none'
}

const readRailPosition = (storageKey, windowRef) => {
    try {
        const value = JSON.parse(windowRef.localStorage.getItem(storageKey) || 'null')
        if (
            Number.isFinite(value?.leftRatio)
            && Number.isFinite(value?.topRatio)
            && value.leftRatio >= 0 && value.leftRatio <= 1
            && value.topRatio >= 0 && value.topRatio <= 1
        ) return value
    } catch {}
    return null
}

const saveRailPosition = (storageKey, left, top, rail, windowRef) => {
    const viewport = getViewportDimensions(windowRef)
    const dimensions = getRailDimensions(rail)
    const maxLeft = Math.max(0, viewport.width - dimensions.width)
    const maxTop = Math.max(0, viewport.height - dimensions.height)
    try {
        windowRef.localStorage.setItem(storageKey, JSON.stringify({
            leftRatio: maxLeft ? left / maxLeft : 0,
            topRatio: maxTop ? top / maxTop : 0,
        }))
    } catch {}
}

export function setupAnnotationRailDragging(rail, {
    storageKey,
    windowRef = window,
} = {}) {
    if (!rail || !storageKey || !windowRef) return () => {}

    const savedPosition = readRailPosition(storageKey, windowRef)
    if (savedPosition) {
        const viewport = getViewportDimensions(windowRef)
        const dimensions = getRailDimensions(rail)
        applyRailPosition(
            rail,
            savedPosition.leftRatio * Math.max(0, viewport.width - dimensions.width),
            savedPosition.topRatio * Math.max(0, viewport.height - dimensions.height),
        )
    }

    let activePointer = null
    let suppressNextClick = false

    const move = event => {
        if (!activePointer || event.pointerId !== activePointer.id) return
        const viewport = getViewportDimensions(windowRef)
        const dimensions = getRailDimensions(rail)
        const left = clamp(
            event.clientX - activePointer.offsetX,
            RAIL_VIEWPORT_PADDING,
            viewport.width - dimensions.width - RAIL_VIEWPORT_PADDING,
        )
        const top = clamp(
            event.clientY - activePointer.offsetY,
            RAIL_VIEWPORT_PADDING,
            viewport.height - dimensions.height - RAIL_VIEWPORT_PADDING,
        )
        if (Math.abs(left - activePointer.initialLeft) > 4 || Math.abs(top - activePointer.initialTop) > 4) {
            activePointer.moved = true
        }
        applyRailPosition(rail, left, top)
    }

    const stop = event => {
        if (!activePointer || event.pointerId !== activePointer.id) return
        const { moved } = activePointer
        activePointer = null
        rail.classList.remove('is-dragging')
        rail.releasePointerCapture?.(event.pointerId)
        if (!moved) return

        const left = Number.parseFloat(rail.style.left) || 0
        const top = Number.parseFloat(rail.style.top) || 0
        saveRailPosition(storageKey, left, top, rail, windowRef)
        suppressNextClick = true
    }

    const start = event => {
        if (event.button !== 0) return
        const rect = rail.getBoundingClientRect()
        activePointer = {
            id: event.pointerId,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
            initialLeft: rect.left,
            initialTop: rect.top,
            moved: false,
        }
        rail.setPointerCapture?.(event.pointerId)
        rail.classList.add('is-dragging')
    }

    const blockDraggedClick = event => {
        if (!suppressNextClick) return
        suppressNextClick = false
        event.preventDefault()
        event.stopImmediatePropagation()
    }

    rail.addEventListener('pointerdown', start)
    rail.addEventListener('click', blockDraggedClick, true)
    windowRef.addEventListener('pointermove', move)
    windowRef.addEventListener('pointerup', stop)
    windowRef.addEventListener('pointercancel', stop)

    return () => {
        rail.removeEventListener('pointerdown', start)
        rail.removeEventListener('click', blockDraggedClick, true)
        windowRef.removeEventListener('pointermove', move)
        windowRef.removeEventListener('pointerup', stop)
        windowRef.removeEventListener('pointercancel', stop)
    }
}

function getTextNodes(root) {
    if (!root?.ownerDocument) return []

    const view = root.ownerDocument.defaultView
    const walker = root.ownerDocument.createTreeWalker(
        root,
        view.NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                return node.parentElement?.closest('script, style, [aria-hidden="true"]')
                    ? view.NodeFilter.FILTER_REJECT
                    : view.NodeFilter.FILTER_ACCEPT
            },
        },
    )
    const nodes = []
    while (walker.nextNode()) nodes.push(walker.currentNode)
    return nodes
}

function createRangeFromOffsets(root, startOffset, endOffset) {
    if (
        !root?.ownerDocument
        || !Number.isSafeInteger(startOffset)
        || !Number.isSafeInteger(endOffset)
        || startOffset < 0
        || endOffset <= startOffset
    ) {
        return null
    }

    const range = root.ownerDocument.createRange()
    let traversed = 0
    let startBoundary = null
    let endBoundary = null

    for (const node of getTextNodes(root)) {
        const next = traversed + node.data.length
        if (!startBoundary && startOffset >= traversed && startOffset <= next) {
            startBoundary = { node, offset: startOffset - traversed }
        }
        if (!endBoundary && endOffset >= traversed && endOffset <= next) {
            endBoundary = { node, offset: endOffset - traversed }
        }
        traversed = next
        if (startBoundary && endBoundary) break
    }

    if (!startBoundary || !endBoundary) return null
    range.setStart(startBoundary.node, startBoundary.offset)
    range.setEnd(endBoundary.node, endBoundary.offset)
    return range
}

function getRangeStartOffset(root, range) {
    const before = root.ownerDocument.createRange()
    before.selectNodeContents(root)
    before.setEnd(range.startContainer, range.startOffset)
    return before.toString().length
}

function commonPrefixLength(left, right) {
    const max = Math.min(left.length, right.length)
    let index = 0
    while (index < max && left[index] === right[index]) index += 1
    return index
}

function commonSuffixLength(left, right) {
    const max = Math.min(left.length, right.length)
    let count = 0
    while (
        count < max
        && left[left.length - 1 - count] === right[right.length - 1 - count]
    ) {
        count += 1
    }
    return count
}

export function buildSelectionAnchor(root, range, sourceRevision) {
    if (
        !root
        || !range
        || typeof sourceRevision !== 'string'
        || !/^[a-f0-9]{64}$/.test(sourceRevision)
        || !root.contains(range.commonAncestorContainer)
    ) {
        return null
    }

    const exact = range.toString()
    if (!exact.trim() || exact.length > MAX_QUOTE_LENGTH) return null

    const fullText = root.textContent || ''
    const startOffset = getRangeStartOffset(root, range)
    const endOffset = startOffset + exact.length

    return {
        exact,
        prefix: fullText.slice(Math.max(0, startOffset - CONTEXT_LENGTH), startOffset),
        suffix: fullText.slice(endOffset, endOffset + CONTEXT_LENGTH),
        startOffset,
        endOffset,
        sourceRevision,
    }
}

export function locateAnchorRange(root, anchor, currentRevision) {
    if (!root || !anchor || typeof anchor.exact !== 'string' || !anchor.exact) return null

    if (anchor.sourceRevision === currentRevision) {
        const directRange = createRangeFromOffsets(root, anchor.startOffset, anchor.endOffset)
        if (directRange?.toString() === anchor.exact) return directRange
    }

    const fullText = root.textContent || ''
    const candidates = []
    let index = fullText.indexOf(anchor.exact)
    while (index !== -1) {
        const before = fullText.slice(Math.max(0, index - CONTEXT_LENGTH), index)
        const after = fullText.slice(
            index + anchor.exact.length,
            index + anchor.exact.length + CONTEXT_LENGTH,
        )
        candidates.push({
            index,
            score: commonSuffixLength(before, anchor.prefix || '')
                + commonPrefixLength(after, anchor.suffix || ''),
        })
        index = fullText.indexOf(anchor.exact, index + 1)
    }

    if (candidates.length === 0) return null
    candidates.sort((left, right) => right.score - left.score || left.index - right.index)
    const best = candidates[0]
    if ((anchor.prefix || anchor.suffix) && best.score === 0) return null
    return createRangeFromOffsets(root, best.index, best.index + anchor.exact.length)
}

export function scrollRangeIntoView(range, scrollRoot, { behavior = 'smooth' } = {}) {
    if (!range || !scrollRoot || typeof range.getBoundingClientRect !== 'function') return false

    const rangeRect = range.getBoundingClientRect()
    const rootRect = typeof scrollRoot.getBoundingClientRect === 'function'
        ? scrollRoot.getBoundingClientRect()
        : { top: 0, height: Number(scrollRoot.clientHeight) || 0 }
    const viewportHeight = Number(scrollRoot.clientHeight) || Number(rootRect.height) || 0
    const rangeHeight = Number(rangeRect.height) || 0
    const centerOffset = Math.max(16, (viewportHeight - rangeHeight) / 2)
    const top = Math.max(
        0,
        (Number(scrollRoot.scrollTop) || 0)
            + (Number(rangeRect.top) || 0)
            - (Number(rootRect.top) || 0)
            - centerOffset,
    )

    if (typeof scrollRoot.scrollTo === 'function') {
        scrollRoot.scrollTo({ top, behavior })
    } else {
        scrollRoot.scrollTop = top
    }
    return true
}

function createElement(document, tagName, className, text) {
    const element = document.createElement(tagName)
    if (className) element.className = className
    if (text !== undefined) element.textContent = text
    return element
}

function readApiError(payload, fallback) {
    if (typeof payload?.msg !== 'string') return fallback
    try {
        const parsed = JSON.parse(payload.msg)
        return typeof parsed === 'string' ? parsed : fallback
    } catch {
        return payload.msg || fallback
    }
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || payload?.err !== 0) {
        const error = new Error(readApiError(payload, `Request failed (${response.status})`))
        error.status = response.status
        throw error
    }
    return payload.data
}

function initShareAnnotations() {
    const appRoot = document.querySelector('#share-annotation-root')
    const articleRoot = document.querySelector('#preview-md, #preview-plain')
    if (!appRoot || !articleRoot) return

    const shareId = appRoot.dataset.shareId || ''
    const lang = appRoot.dataset.lang === 'zh-TW' ? 'zh-TW' : 'en'
    if (!shareId) return

    const copy = lang === 'zh-TW'
        ? {
            title: '段落註解',
            open: '開啟段落註解',
            move: '拖曳以移動註解按鈕',
            close: '關閉註解欄',
            annotate: '註解',
            selectionHint: '圈選文章文字即可新增註解。',
            empty: '目前沒有註解。圈選一段文字，開始第一個討論。',
            name: '你的名稱',
            comment: '留言內容',
            send: '送出註解',
            cancel: '取消',
            reply: '回覆',
            sendReply: '送出回覆',
            detached: '原文已移除',
            locate: '定位原文',
            loading: '正在載入註解…',
            loadError: '註解載入失敗，請重新整理後再試。',
            saveError: '留言送出失敗，內容已保留，請再試一次。',
            stale: '文章內容已更新，請重新圈選文字。',
            quoted: '你圈選的文字',
            messages: '則留言',
        }
        : {
            title: 'Paragraph annotations',
            open: 'Open paragraph annotations',
            move: 'Drag to move the annotation button',
            close: 'Close annotations',
            annotate: 'Annotate',
            selectionHint: 'Select article text to start an annotation.',
            empty: 'No annotations yet. Select text to start the first discussion.',
            name: 'Your name',
            comment: 'Comment',
            send: 'Post annotation',
            cancel: 'Cancel',
            reply: 'Reply',
            sendReply: 'Post reply',
            detached: 'Original text removed',
            locate: 'Locate in article',
            loading: 'Loading annotations…',
            loadError: 'Annotations could not be loaded. Refresh and try again.',
            saveError: 'Your comment was not posted. Your text is preserved; try again.',
            stale: 'The article changed. Select the text again.',
            quoted: 'Selected text',
            messages: 'messages',
        }

    const state = {
        currentRevision: '',
        pendingAnchor: null,
        threads: [],
    }

    const panel = createElement(document, 'aside', 'annotation-sidebar')
    panel.id = 'annotation-sidebar'
    panel.setAttribute('aria-label', copy.title)
    panel.setAttribute('aria-hidden', 'true')

    const header = createElement(document, 'header', 'annotation-sidebar-header')
    const heading = createElement(document, 'h2', '', copy.title)
    heading.tabIndex = -1
    const closeButton = createElement(document, 'button', 'annotation-icon-button', '×')
    closeButton.type = 'button'
    closeButton.setAttribute('aria-label', copy.close)
    header.append(heading, closeButton)

    const intro = createElement(document, 'p', 'annotation-sidebar-intro', copy.selectionHint)
    const status = createElement(document, 'div', 'annotation-status')
    status.setAttribute('role', 'status')
    status.setAttribute('aria-live', 'polite')

    const composer = createElement(document, 'form', 'annotation-composer')
    composer.hidden = true
    const composerLabel = createElement(document, 'span', 'annotation-field-label', copy.quoted)
    const composerQuote = createElement(document, 'blockquote', 'annotation-composer-quote')
    const authorInput = createElement(document, 'input', 'annotation-input')
    authorInput.name = 'authorName'
    authorInput.required = true
    authorInput.maxLength = 40
    authorInput.autocomplete = 'name'
    authorInput.placeholder = copy.name
    const bodyInput = createElement(document, 'textarea', 'annotation-textarea')
    bodyInput.name = 'body'
    bodyInput.required = true
    bodyInput.maxLength = 2000
    bodyInput.rows = 4
    bodyInput.placeholder = copy.comment
    const composerError = createElement(document, 'p', 'annotation-inline-error')
    composerError.setAttribute('aria-live', 'polite')
    const composerActions = createElement(document, 'div', 'annotation-form-actions')
    const cancelButton = createElement(document, 'button', 'annotation-secondary-button', copy.cancel)
    cancelButton.type = 'button'
    const submitButton = createElement(document, 'button', 'annotation-primary-button', copy.send)
    submitButton.type = 'submit'
    composerActions.append(cancelButton, submitButton)
    composer.append(
        composerLabel,
        composerQuote,
        authorInput,
        bodyInput,
        composerError,
        composerActions,
    )

    const threadList = createElement(document, 'div', 'annotation-thread-list')
    const railButton = createElement(document, 'button', 'annotation-rail-button')
    railButton.type = 'button'
    railButton.setAttribute('aria-label', copy.open)
    railButton.title = copy.move
    railButton.setAttribute('aria-controls', panel.id)
    railButton.setAttribute('aria-expanded', 'false')
    const railIcon = createElement(document, 'span', 'annotation-rail-icon', '◰')
    railIcon.setAttribute('aria-hidden', 'true')
    const railCount = createElement(document, 'span', 'annotation-rail-count', '0')
    railButton.append(railIcon, railCount)

    const selectionButton = createElement(document, 'button', 'annotation-selection-button', copy.annotate)
    selectionButton.type = 'button'
    selectionButton.hidden = true

    panel.append(header, intro, composer, status, threadList)
    appRoot.append(railButton, selectionButton, panel)

    try {
        authorInput.value = window.localStorage.getItem(AUTHOR_STORAGE_KEY) || ''
    } catch {
        authorInput.value = ''
    }
    setupAnnotationRailDragging(railButton, {
        storageKey: `${RAIL_POSITION_STORAGE_PREFIX}${shareId}`,
    })

    const setPanelOpen = open => {
        document.body.classList.toggle('annotation-sidebar-open', open)
        panel.setAttribute('aria-hidden', open ? 'false' : 'true')
        railButton.setAttribute('aria-expanded', open ? 'true' : 'false')
        if (open) heading.focus?.()
    }

    const showComposer = anchor => {
        state.pendingAnchor = anchor
        composerQuote.textContent = anchor.exact
        composerError.textContent = ''
        composer.hidden = false
        setPanelOpen(true)
        window.setTimeout(() => (authorInput.value ? bodyInput : authorInput).focus(), 0)
    }

    const hideComposer = () => {
        state.pendingAnchor = null
        composer.hidden = true
        composerError.textContent = ''
        selectionButton.hidden = true
    }

    const setSaving = saving => {
        submitButton.disabled = saving
        cancelButton.disabled = saving
        authorInput.disabled = saving
        bodyInput.disabled = saving
    }

    const updateHighlight = () => {
        const located = new Map()
        const ranges = []
        for (const thread of state.threads) {
            const range = locateAnchorRange(articleRoot, thread.anchor, state.currentRevision)
            located.set(thread.id, range)
            if (range) ranges.push(range)
        }

        if (globalThis.CSS?.highlights && globalThis.Highlight) {
            if (ranges.length) CSS.highlights.set('share-annotations', new Highlight(...ranges))
            else CSS.highlights.delete('share-annotations')
        }
        return located
    }

    const makeReplyForm = thread => {
        const form = createElement(document, 'form', 'annotation-reply-form')
        form.hidden = true
        const replyAuthor = createElement(document, 'input', 'annotation-input')
        replyAuthor.required = true
        replyAuthor.maxLength = 40
        replyAuthor.placeholder = copy.name
        replyAuthor.value = authorInput.value
        const replyBody = createElement(document, 'textarea', 'annotation-textarea')
        replyBody.required = true
        replyBody.maxLength = 2000
        replyBody.rows = 3
        replyBody.placeholder = copy.comment
        const replyError = createElement(document, 'p', 'annotation-inline-error')
        replyError.setAttribute('aria-live', 'polite')
        const replySubmit = createElement(document, 'button', 'annotation-primary-button', copy.sendReply)
        replySubmit.type = 'submit'
        form.append(replyAuthor, replyBody, replyError, replySubmit)

        form.addEventListener('submit', async event => {
            event.preventDefault()
            replyError.textContent = ''
            replySubmit.disabled = true
            try {
                const data = await requestJson(
                    `/api/shares/${encodeURIComponent(shareId)}/annotations/${encodeURIComponent(thread.id)}/messages`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            authorName: replyAuthor.value,
                            body: replyBody.value,
                        }),
                    },
                )
                thread.messages.push(data.message)
                thread.messageCount += 1
                thread.updatedAt = data.message.createdAt
                try {
                    window.localStorage.setItem(AUTHOR_STORAGE_KEY, replyAuthor.value.trim())
                } catch {}
                renderThreads()
            } catch (error) {
                replyError.textContent = error.message || copy.saveError
            } finally {
                replySubmit.disabled = false
            }
        })

        return form
    }

    const renderThreads = () => {
        threadList.replaceChildren()
        railCount.textContent = String(state.threads.length)

        if (state.threads.length === 0) {
            threadList.append(createElement(document, 'p', 'annotation-empty-state', copy.empty))
            updateHighlight()
            return
        }

        const located = updateHighlight()
        for (const thread of state.threads) {
            const card = createElement(document, 'article', 'annotation-thread')
            card.dataset.threadId = thread.id
            const cardHeader = createElement(document, 'div', 'annotation-thread-header')
            const quote = createElement(document, 'blockquote', 'annotation-thread-quote', thread.anchor.exact)
            const location = located.get(thread.id)
            const locationButton = createElement(
                document,
                'button',
                location ? 'annotation-locate-button' : 'annotation-detached-label',
                location ? copy.locate : copy.detached,
            )
            locationButton.type = 'button'
            locationButton.disabled = !location
            if (location) {
                locationButton.addEventListener('click', () => {
                    const target = location.startContainer.parentElement
                    const scrollRoot = articleRoot.closest('.contents')
                        || document.scrollingElement
                        || document.documentElement
                    scrollRangeIntoView(location, scrollRoot)
                    target?.classList.add('annotation-source-flash')
                    window.setTimeout(() => target?.classList.remove('annotation-source-flash'), 1400)
                })
            }
            cardHeader.append(quote, locationButton)

            const messages = createElement(document, 'div', 'annotation-messages')
            for (const message of thread.messages) {
                const item = createElement(document, 'div', 'annotation-message')
                const meta = createElement(document, 'div', 'annotation-message-meta')
                const author = createElement(document, 'strong', '', message.authorName)
                const date = createElement(
                    document,
                    'time',
                    '',
                    new Intl.DateTimeFormat(lang, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    }).format(new Date(message.createdAt * 1000)),
                )
                meta.append(author, date)
                item.append(meta, createElement(document, 'p', '', message.body))
                messages.append(item)
            }

            const footer = createElement(document, 'div', 'annotation-thread-footer')
            const count = createElement(
                document,
                'span',
                'annotation-message-count',
                `${thread.messageCount} ${copy.messages}`,
            )
            const replyButton = createElement(document, 'button', 'annotation-secondary-button', copy.reply)
            replyButton.type = 'button'
            const replyForm = makeReplyForm(thread)
            replyButton.addEventListener('click', () => {
                replyForm.hidden = !replyForm.hidden
                if (!replyForm.hidden) replyForm.querySelector('textarea')?.focus()
            })
            footer.append(count, replyButton)
            card.append(cardHeader, messages, footer, replyForm)
            threadList.append(card)
        }
    }

    const loadThreads = async () => {
        status.textContent = copy.loading
        try {
            const data = await requestJson(
                `/api/shares/${encodeURIComponent(shareId)}/annotations?limit=25`,
            )
            state.currentRevision = data.sourceRevision || ''
            state.threads = Array.isArray(data.threads) ? data.threads : []
            status.textContent = ''
            renderThreads()
        } catch {
            status.textContent = copy.loadError
        }
    }

    const captureSelection = () => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount !== 1 || selection.isCollapsed || !state.currentRevision) {
            selectionButton.hidden = true
            return
        }

        const range = selection.getRangeAt(0)
        const anchor = buildSelectionAnchor(articleRoot, range, state.currentRevision)
        if (!anchor) {
            selectionButton.hidden = true
            return
        }

        state.pendingAnchor = anchor
        const rect = range.getBoundingClientRect()
        selectionButton.style.left = `${Math.min(window.innerWidth - 76, Math.max(8, rect.left + rect.width / 2))}px`
        selectionButton.style.top = `${Math.min(window.innerHeight - 48, Math.max(8, rect.bottom + 10))}px`
        selectionButton.hidden = false
    }

    railButton.addEventListener('click', () => {
        setPanelOpen(panel.getAttribute('aria-hidden') === 'true')
    })
    closeButton.addEventListener('click', () => setPanelOpen(false))
    cancelButton.addEventListener('click', hideComposer)
    selectionButton.addEventListener('pointerdown', event => event.preventDefault())
    selectionButton.addEventListener('click', () => {
        if (state.pendingAnchor) showComposer(state.pendingAnchor)
    })

    composer.addEventListener('submit', async event => {
        event.preventDefault()
        if (!state.pendingAnchor) return

        composerError.textContent = ''
        setSaving(true)
        try {
            const data = await requestJson(
                `/api/shares/${encodeURIComponent(shareId)}/annotations`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        anchor: state.pendingAnchor,
                        authorName: authorInput.value,
                        body: bodyInput.value,
                    }),
                },
            )
            state.threads.unshift(data.thread)
            try {
                window.localStorage.setItem(AUTHOR_STORAGE_KEY, authorInput.value.trim())
            } catch {}
            bodyInput.value = ''
            hideComposer()
            window.getSelection()?.removeAllRanges()
            renderThreads()
        } catch (error) {
            composerError.textContent = error.status === 409 ? copy.stale : (error.message || copy.saveError)
        } finally {
            setSaving(false)
        }
    })

    let selectionTimer = null
    document.addEventListener('selectionchange', () => {
        window.clearTimeout(selectionTimer)
        selectionTimer = window.setTimeout(captureSelection, 80)
    })
    articleRoot.addEventListener('pointerup', () => window.setTimeout(captureSelection, 0))
    articleRoot.addEventListener('keyup', captureSelection)

    let highlightTimer = null
    const observer = new MutationObserver(() => {
        window.clearTimeout(highlightTimer)
        highlightTimer = window.setTimeout(() => {
            if (state.currentRevision) renderThreads()
        }, 120)
    })
    observer.observe(articleRoot, { childList: true, subtree: true })

    loadThreads()
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShareAnnotations, { once: true })
    } else {
        initShareAnnotations()
    }
}
