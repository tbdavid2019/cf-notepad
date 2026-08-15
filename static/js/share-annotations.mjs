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

export function createAnnotationThreadUrl(locationRef, threadId) {
    const url = new URL(typeof locationRef === 'string' ? locationRef : locationRef?.href)
    const normalizedThreadId = typeof threadId === 'string' ? threadId.trim() : ''
    if (!normalizedThreadId) return url.toString()

    url.searchParams.delete('pw')
    url.searchParams.delete('vpw')
    url.searchParams.delete('password')
    url.hash = `annotation=${encodeURIComponent(normalizedThreadId)}`
    return url.toString()
}

export function getAnnotationThreadIdFromHash(hash) {
    const match = /^#annotation=([^&]+)$/.exec(typeof hash === 'string' ? hash : '')
    if (!match) return null
    try {
        const threadId = decodeURIComponent(match[1]).trim()
        return threadId || null
    } catch {
        return null
    }
}

async function copyTextToClipboard(text, documentRef = document) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text)
            return
        } catch {}
    }

    const field = documentRef.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    documentRef.body.append(field)
    field.select()
    const copied = documentRef.execCommand?.('copy') === true
    field.remove()
    if (!copied) throw new DOMException('The request is not allowed', 'NotAllowedError')
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
            copyLink: '複製連結',
            linkCopied: '註解連結已複製。',
            copyError: '無法複製連結，請再試一次。',
            close: '關閉',
            annotate: '註解',
            copy: '複製',
            translate: '翻譯',
            askAi: '詢問 AI',
            textCopied: '已複製選取文字',
            translationCopied: '已複製譯文',
            answerCopied: '已複製回答',
            aiThinking: 'AI 思考中…',
            aiError: 'AI 回應失敗，請稍後再試。',
            askPlaceholder: '提問，例如：這段話在說明什麼？',
            sendAsk: '發送',
            chipExplain: '🔍 解釋概念',
            chipSummary: '💡 重點摘要',
            chipDerivation: '📐 公式推導',
            chipCode: '💻 程式碼解析',
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
            copyLink: 'Copy link',
            linkCopied: 'Annotation link copied.',
            copyError: 'The annotation link could not be copied. Try again.',
            close: 'Close',
            annotate: 'Annotate',
            copy: 'Copy',
            translate: 'Translate',
            askAi: 'Ask AI',
            textCopied: 'Selected text copied',
            translationCopied: 'Translation copied',
            answerCopied: 'Answer copied',
            aiThinking: 'AI thinking…',
            aiError: 'AI request failed. Please try again.',
            askPlaceholder: 'Ask, e.g. What does this mean?',
            sendAsk: 'Send',
            chipExplain: '🔍 Explain',
            chipSummary: '💡 Summary',
            chipDerivation: '📐 Math derivation',
            chipCode: '💻 Code analysis',
            selectionHint: 'Select article text to start an annotation.',
            empty: 'No annotations yet. Select text to start the first discussion.',
            name: 'Your name',
            comment: 'Comment',
            send: 'Post annotation',
            cancel: 'Cancel',
            reply: 'Reply',
            sendReply: 'Post reply',
            detached: 'Original text removed',
            locate: 'Locate original',
            loading: 'Loading annotations…',
            loadError: 'Failed to load annotations. Refresh and try again.',
            saveError: 'Failed to post comment. Your text was preserved.',
            stale: 'Article updated. Please reselect text.',
            quoted: 'Selected text',
            messages: 'comments',
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

    const selectionToolbar = createElement(document, 'div', 'selection-action-toolbar')
    selectionToolbar.hidden = true

    const copyBtn = createElement(document, 'button', 'selection-action-btn selection-action-copy')
    copyBtn.type = 'button'
    copyBtn.innerHTML = `<span class="selection-action-icon" aria-hidden="true">📋</span><span>${copy.copy}</span>`
    copyBtn.title = copy.copy

    const translateBtn = createElement(document, 'button', 'selection-action-btn selection-action-translate')
    translateBtn.type = 'button'
    translateBtn.innerHTML = `<span class="selection-action-icon" aria-hidden="true">🌐</span><span>${copy.translate}</span>`
    translateBtn.title = copy.translate

    const askAiBtn = createElement(document, 'button', 'selection-action-btn selection-action-ask-ai')
    askAiBtn.type = 'button'
    askAiBtn.innerHTML = `<span class="selection-action-icon" aria-hidden="true">✨</span><span>${copy.askAi}</span>`
    askAiBtn.title = copy.askAi

    const selectionButton = createElement(document, 'button', 'annotation-selection-button selection-action-btn selection-action-annotate')
    selectionButton.type = 'button'
    selectionButton.innerHTML = `<span class="selection-action-icon" aria-hidden="true">💬</span><span>${copy.annotate}</span>`
    selectionButton.title = copy.annotate

    selectionToolbar.append(copyBtn, translateBtn, askAiBtn, selectionButton)

    const aiPopover = createElement(document, 'div', 'selection-ai-popover')
    aiPopover.hidden = true
    aiPopover.innerHTML = `
        <div class="selection-ai-popover-header">
            <div class="selection-ai-popover-title">
                <span class="selection-ai-title-icon" aria-hidden="true">✨</span>
                <span class="selection-ai-title-text">AI 助手</span>
            </div>
            <button type="button" class="selection-ai-close-btn" aria-label="${copy.close}">✕</button>
        </div>
        <div class="selection-ai-popover-body">
            <div class="selection-ai-quote-preview">
                <span class="selection-ai-quote-icon" aria-hidden="true">📌</span>
                <span class="selection-ai-quote-text"></span>
            </div>
            <div class="selection-ai-loading" style="display:none;">
                <div class="selection-ai-spinner"></div>
                <span class="selection-ai-loading-text">${copy.aiThinking}</span>
            </div>
            <div class="selection-ai-result-view" style="display:none;">
                <div class="selection-ai-result-content"></div>
                <div class="selection-ai-result-actions">
                    <button type="button" class="selection-ai-action-btn selection-ai-copy-result-btn">📋 ${copy.copy}</button>
                </div>
            </div>
            <div class="selection-ai-ask-view" style="display:none;">
                <div class="selection-ai-presets">
                    <button type="button" class="selection-ai-chip" data-prompt="請用通俗易懂的語言詳細解釋這段內容的核心概念與背景">${copy.chipExplain}</button>
                    <button type="button" class="selection-ai-chip" data-prompt="請提煉這段內容的核心要點摘要">${copy.chipSummary}</button>
                    <button type="button" class="selection-ai-chip" data-prompt="請詳細推導並說明其中的公式與數學邏輯">${copy.chipDerivation}</button>
                    <button type="button" class="selection-ai-chip" data-prompt="請詳細解釋這段程式碼的邏輯、運作機制與潛在邊界情況">${copy.chipCode}</button>
                </div>
                <form class="selection-ai-ask-form">
                    <input type="text" class="selection-ai-ask-input" placeholder="${copy.askPlaceholder}" required />
                    <button type="submit" class="selection-ai-ask-submit">${copy.sendAsk}</button>
                </form>
            </div>
        </div>
    `

    panel.append(header, intro, composer, status, threadList)
    appRoot.append(railButton, selectionToolbar, aiPopover, panel)

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
            const copyLinkButton = createElement(document, 'button', 'annotation-copy-link-button', copy.copyLink)
            copyLinkButton.type = 'button'
            copyLinkButton.addEventListener('click', async () => {
                try {
                    await copyTextToClipboard(createAnnotationThreadUrl(window.location, thread.id))
                    status.textContent = copy.linkCopied
                } catch {
                    status.textContent = copy.copyError
                }
            })
            cardHeader.append(quote, locationButton, copyLinkButton)

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

    const locateThreadFromLocation = () => {
        const threadId = getAnnotationThreadIdFromHash(window.location.hash)
        if (!threadId) return
        const thread = state.threads.find(item => item.id === threadId)
        if (!thread) return

        setPanelOpen(true)
        const range = locateAnchorRange(articleRoot, thread.anchor, state.currentRevision)
        if (!range) return
        const scrollRoot = articleRoot.closest('.contents')
            || document.scrollingElement
            || document.documentElement
        scrollRangeIntoView(range, scrollRoot)
        const target = range.startContainer.parentElement
        target?.classList.add('annotation-source-flash')
        window.setTimeout(() => target?.classList.remove('annotation-source-flash'), 1400)
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
            locateThreadFromLocation()
        } catch {
            status.textContent = copy.loadError
        }
    }

    const positionAiPopover = () => {
        if (!state.lastSelectionRect) return
        const rect = state.lastSelectionRect
        const popoverWidth = Math.min(400, window.innerWidth - 24)
        const left = Math.min(window.innerWidth - popoverWidth / 2 - 12, Math.max(popoverWidth / 2 + 12, rect.left + rect.width / 2))
        aiPopover.style.left = `${left}px`

        const spaceBelow = window.innerHeight - rect.bottom
        if (spaceBelow > 280 || rect.top < 280) {
            aiPopover.style.top = `${Math.min(window.innerHeight - 320, rect.bottom + 10)}px`
            aiPopover.style.bottom = 'auto'
        } else {
            aiPopover.style.top = `${Math.max(10, rect.top - 300)}px`
            aiPopover.style.bottom = 'auto'
        }
    }

    const openAiPopover = ({ title, showLoading = false, showAskView = false }) => {
        const titleEl = aiPopover.querySelector('.selection-ai-title-text')
        const loading = aiPopover.querySelector('.selection-ai-loading')
        const resultView = aiPopover.querySelector('.selection-ai-result-view')
        const askView = aiPopover.querySelector('.selection-ai-ask-view')
        const quoteTextEl = aiPopover.querySelector('.selection-ai-quote-text')

        if (titleEl && title) titleEl.textContent = title
        if (quoteTextEl && state.pendingAnchor?.exact) {
            quoteTextEl.textContent = state.pendingAnchor.exact
        }
        loading.style.display = showLoading ? 'flex' : 'none'
        resultView.style.display = 'none'
        askView.style.display = showAskView ? 'block' : 'none'

        selectionToolbar.hidden = true
        aiPopover.hidden = false
        positionAiPopover()

        if (showAskView) {
            const input = aiPopover.querySelector('.selection-ai-ask-input')
            if (input) {
                input.value = ''
                window.setTimeout(() => input.focus(), 50)
            }
        }
    }

    const formatAiResult = text => {
        if (!text) return ''
        if (typeof window.renderMarkdown === 'function') {
            try {
                const rendered = window.renderMarkdown(text)
                if (typeof rendered === 'string') return rendered
            } catch {}
        }
        if (typeof window.marked?.parse === 'function') {
            try {
                const rendered = window.marked.parse(text, { async: false })
                if (typeof rendered === 'string') return rendered
            } catch {}
        }
        const div = document.createElement('div')
        div.textContent = text
        let html = div.innerHTML
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px;font-family:monospace;">$1</code>')
        html = html.replace(/\n/g, '<br>')
        return html
    }

    const showAiResult = (text, copySuccessMsg) => {
        const loading = aiPopover.querySelector('.selection-ai-loading')
        const resultView = aiPopover.querySelector('.selection-ai-result-view')
        const resultContent = aiPopover.querySelector('.selection-ai-result-content')
        const copyResultBtn = aiPopover.querySelector('.selection-ai-copy-result-btn')
        const askView = aiPopover.querySelector('.selection-ai-ask-view')

        loading.style.display = 'none'
        askView.style.display = 'none'
        resultView.style.display = 'block'
        resultContent.innerHTML = formatAiResult(text)

        if (typeof window.renderMathInElement === 'function') {
            try {
                window.renderMathInElement(resultContent, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                    ],
                    throwOnError: false,
                })
            } catch {}
        }

        positionAiPopover()

        copyResultBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(text)
                if (typeof window.showToast === 'function') {
                    window.showToast(copySuccessMsg || copy.answerCopied)
                }
            } catch {}
        }
    }

    const showAiError = errorMessage => {
        const loading = aiPopover.querySelector('.selection-ai-loading')
        const resultView = aiPopover.querySelector('.selection-ai-result-view')
        const resultContent = aiPopover.querySelector('.selection-ai-result-content')
        const askView = aiPopover.querySelector('.selection-ai-ask-view')

        loading.style.display = 'none'
        askView.style.display = 'none'
        resultView.style.display = 'block'
        resultContent.innerHTML = `<span style="color:#d9534f;font-weight:600;">⚠️ ${errorMessage}</span>`
        positionAiPopover()
    }

    const closeAiPopover = () => {
        aiPopover.hidden = true
    }

    const executeAiRequest = async ({ mode, instruction, targetLanguage, copySuccessMsg }) => {
        if (!state.pendingAnchor?.exact) return
        const text = state.pendingAnchor.exact
        try {
            const data = await requestJson(
                `/api/shares/${encodeURIComponent(shareId)}/ai-assistant`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text,
                        mode,
                        instruction,
                        targetLanguage,
                    }),
                },
            )
            if (data?.result) {
                showAiResult(data.result, copySuccessMsg)
            } else {
                showAiError(data?.message || copy.aiError)
            }
        } catch (err) {
            showAiError(err.message || copy.aiError)
        }
    }

    const captureSelection = () => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount !== 1 || selection.isCollapsed || !state.currentRevision) {
            selectionToolbar.hidden = true
            return
        }

        const range = selection.getRangeAt(0)
        const anchor = buildSelectionAnchor(articleRoot, range, state.currentRevision)
        if (!anchor) {
            selectionToolbar.hidden = true
            return
        }

        state.pendingAnchor = anchor
        const rect = range.getBoundingClientRect()
        state.lastSelectionRect = rect

        const toolbarWidth = 260
        const left = Math.min(window.innerWidth - toolbarWidth / 2 - 12, Math.max(toolbarWidth / 2 + 12, rect.left + rect.width / 2))
        selectionToolbar.style.left = `${left}px`

        if (rect.top > 54) {
            selectionToolbar.style.top = `${Math.max(8, rect.top - 46)}px`
        } else {
            selectionToolbar.style.top = `${Math.min(window.innerHeight - 48, rect.bottom + 8)}px`
        }
        selectionToolbar.hidden = false
    }

    copyBtn.addEventListener('click', async () => {
        if (!state.pendingAnchor?.exact) return
        try {
            await navigator.clipboard.writeText(state.pendingAnchor.exact)
            if (typeof window.showToast === 'function') {
                window.showToast(copy.textCopied)
            }
        } catch {}
        selectionToolbar.hidden = true
    })

    translateBtn.addEventListener('click', () => {
        if (!state.pendingAnchor?.exact) return
        const text = state.pendingAnchor.exact
        const hasChinese = /[\u3400-\u9fff]/.test(text)
        const targetLanguage = hasChinese ? 'English' : 'Traditional Chinese'
        const title = `${copy.translate} (${hasChinese ? '➔ English' : '➔ 繁體中文'})`
        openAiPopover({ title, showLoading: true })
        executeAiRequest({
            mode: 'translate',
            targetLanguage,
            copySuccessMsg: copy.translationCopied,
        })
    })

    askAiBtn.addEventListener('click', () => {
        if (!state.pendingAnchor?.exact) return
        openAiPopover({ title: copy.askAi, showAskView: true })
    })

    const closeAiBtn = aiPopover.querySelector('.selection-ai-close-btn')
    if (closeAiBtn) closeAiBtn.addEventListener('click', closeAiPopover)

    const presetChips = aiPopover.querySelectorAll('.selection-ai-chip')
    for (const chip of presetChips) {
        chip.addEventListener('click', () => {
            const prompt = chip.dataset.prompt
            const chipTitle = chip.textContent.trim()
            openAiPopover({ title: `${copy.askAi} · ${chipTitle}`, showLoading: true })
            executeAiRequest({
                mode: 'ask',
                instruction: prompt,
                copySuccessMsg: copy.answerCopied,
            })
        })
    }

    const askForm = aiPopover.querySelector('.selection-ai-ask-form')
    const askInput = aiPopover.querySelector('.selection-ai-ask-input')
    if (askForm && askInput) {
        askForm.addEventListener('submit', event => {
            event.preventDefault()
            const question = askInput.value.trim()
            if (!question) return
            openAiPopover({ title: `${copy.askAi} · ${question.slice(0, 16)}...`, showLoading: true })
            executeAiRequest({
                mode: 'ask',
                instruction: question,
                copySuccessMsg: copy.answerCopied,
            })
        })
    }

    railButton.addEventListener('click', () => {
        setPanelOpen(panel.getAttribute('aria-hidden') === 'true')
    })
    closeButton.addEventListener('click', () => setPanelOpen(false))
    cancelButton.addEventListener('click', hideComposer)
    selectionButton.addEventListener('pointerdown', event => event.preventDefault())
    selectionButton.addEventListener('click', () => {
        if (state.pendingAnchor) {
            showComposer(state.pendingAnchor)
            selectionToolbar.hidden = true
            aiPopover.hidden = true
        }
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
    window.addEventListener('hashchange', locateThreadFromLocation)

    let highlightTimer = null
    const observer = new MutationObserver(() => {
        window.clearTimeout(highlightTimer)
        highlightTimer = window.setTimeout(() => {
            if (state.currentRevision) renderThreads()
        }, 120)
    })
    observer.observe(articleRoot, { childList: true, subtree: true })

    document.addEventListener('pointerdown', event => {
        if (selectionToolbar.hidden && aiPopover.hidden) return
        if (selectionToolbar.contains(event.target) || aiPopover.contains(event.target) || panel.contains(event.target)) {
            return
        }
        selectionToolbar.hidden = true
        aiPopover.hidden = true
    })

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            if (!aiPopover.hidden) {
                aiPopover.hidden = true
            }
            if (!selectionToolbar.hidden) {
                selectionToolbar.hidden = true
            }
        }
    })

    loadThreads()
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShareAnnotations, { once: true })
    } else {
        initShareAnnotations()
    }
}
