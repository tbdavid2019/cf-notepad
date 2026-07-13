const TOOLBAR_TEXT = {
    'zh-TW': {
        bold: '粗體文字', italic: '斜體文字', strike: '刪除線文字', inlineCode: '程式碼',
        link: '連結文字', codeBlock: '程式碼', table: '| 欄位 | 內容 |\n| --- | --- |\n| 項目 | 說明 |', imageAlt: '圖片說明',
    },
    'en-US': {
        bold: 'bold text', italic: 'italic text', strike: 'strikethrough text', inlineCode: 'code',
        link: 'link text', codeBlock: 'code', table: '| Field | Content |\n| --- | --- |\n| Item | Description |', imageAlt: 'image description',
    },
}

const getToolbarText = lang => TOOLBAR_TEXT[lang] || TOOLBAR_TEXT['zh-TW']

const INLINE_COMMANDS = {
    bold: { prefix: '**', suffix: '**' },
    italic: { prefix: '*', suffix: '*' },
    strike: { prefix: '~~', suffix: '~~' },
    inlineCode: { prefix: '`', suffix: '`' },
}

const LIST_MARKER = /^\s*(?:[-*+] |\d+\. )(?:\[[ xX]\] )?/

const replaceInline = (text, start, end, command, labels) => {
    const definition = INLINE_COMMANDS[command]
    const selected = text.slice(start, end)
    const value = selected || labels[command]
    const replacement = definition.prefix + value + definition.suffix
    const replacementStart = start + definition.prefix.length

    return {
        text: text.slice(0, start) + replacement + text.slice(end),
        selectionStart: replacementStart,
        selectionEnd: replacementStart + value.length,
    }
}

const replaceLink = (text, start, end, labels) => {
    const label = text.slice(start, end) || labels.link
    const url = 'https://example.com'
    const replacement = `[${label}](${url})`
    const urlStart = start + label.length + 3

    return {
        text: text.slice(0, start) + replacement + text.slice(end),
        selectionStart: urlStart,
        selectionEnd: urlStart + url.length,
    }
}

const selectedLineRange = (text, start, end) => {
    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1
    const nextLineBreak = text.indexOf('\n', end)
    const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak
    return { lineStart, lineEnd }
}

const replaceBlockLines = (text, start, end, transform) => {
    const { lineStart, lineEnd } = selectedLineRange(text, start, end)
    const selectedLines = text.slice(lineStart, lineEnd).split('\n')
    const replacement = selectedLines.map(transform).join('\n')

    return {
        text: text.slice(0, lineStart) + replacement + text.slice(lineEnd),
        selectionStart: lineStart,
        selectionEnd: lineStart + replacement.length,
    }
}

const replaceBlockWrapper = (text, start, end, placeholder) => {
    const { lineStart, lineEnd } = selectedLineRange(text, start, end)
    const selected = text.slice(lineStart, lineEnd) || placeholder
    const replacement = '```\n' + selected + '\n```'

    return {
        text: text.slice(0, lineStart) + replacement + text.slice(lineEnd),
        selectionStart: lineStart + 4,
        selectionEnd: lineStart + 4 + selected.length,
    }
}

const replaceSnippet = (text, start, end, snippet, selectionStart, selectionEnd) => ({
    text: text.slice(0, start) + snippet + text.slice(end),
    selectionStart: start + selectionStart,
    selectionEnd: start + selectionEnd,
})

export const applyMarkdownCommand = (text, start, end, command, lang = 'zh-TW') => {
    const source = String(text || '')
    const safeStart = Math.max(0, Math.min(Number(start) || 0, source.length))
    const safeEnd = Math.max(safeStart, Math.min(Number(end) || safeStart, source.length))
    const labels = getToolbarText(lang)

    if (INLINE_COMMANDS[command]) return replaceInline(source, safeStart, safeEnd, command, labels)
    if (command === 'link') return replaceLink(source, safeStart, safeEnd, labels)
    if (command === 'heading1' || command === 'heading2' || command === 'heading3') {
        const level = Number(command.slice(-1))
        return replaceBlockLines(source, safeStart, safeEnd, line => `${'#'.repeat(level)} ${line.replace(/^\s{0,3}#{1,6}\s*/, '')}`)
    }
    if (command === 'quote') {
        return replaceBlockLines(source, safeStart, safeEnd, line => `> ${line.replace(/^>\s?/, '')}`)
    }
    if (command === 'bullet' || command === 'ordered' || command === 'task') {
        return replaceBlockLines(source, safeStart, safeEnd, (line, index) => {
            const content = line.replace(LIST_MARKER, '')
            if (command === 'ordered') return `${index + 1}. ${content}`
            if (command === 'task') return `- [ ] ${content}`
            return `- ${content}`
        })
    }
    if (command === 'codeBlock') return replaceBlockWrapper(source, safeStart, safeEnd, labels.codeBlock)
    if (command === 'rule') {
        return replaceSnippet(source, safeStart, safeEnd, '---', 0, 3)
    }
    if (command === 'table') {
        return replaceSnippet(source, safeStart, safeEnd, labels.table, 2, 4)
    }
    if (command === 'image') {
        const snippet = `![${labels.imageAlt}](https://example.com/image.png)`
        const urlStart = 8
        return replaceSnippet(source, safeStart, safeEnd, snippet, urlStart, urlStart + 29)
    }

    return { text: source, selectionStart: safeStart, selectionEnd: safeEnd }
}

const SHORTCUTS = {
    b: 'bold',
    i: 'italic',
    k: 'link',
}

const BOX_UPLOAD_ENDPOINT = 'https://box.glsoft.ai/api.php?action=upload'

const normalizeEditorState = state => ({
    value: String(state?.value || ''),
    selectionStart: Math.max(0, Number(state?.selectionStart) || 0),
    selectionEnd: Math.max(0, Number(state?.selectionEnd) || 0),
})

const sameEditorState = (left, right) => left.value === right.value
    && left.selectionStart === right.selectionStart
    && left.selectionEnd === right.selectionEnd

export const createEditorHistory = initialState => {
    let entries = [normalizeEditorState(initialState)]
    let cursor = 0

    const move = direction => {
        const nextCursor = cursor + direction
        if (nextCursor < 0 || nextCursor >= entries.length) return null
        cursor = nextCursor
        return { ...entries[cursor] }
    }

    return {
        record(state) {
            const next = normalizeEditorState(state)
            if (sameEditorState(entries[cursor], next)) return
            entries = entries.slice(0, cursor + 1)
            entries.push(next)
            cursor = entries.length - 1
        },
        undo: () => move(-1),
        redo: () => move(1),
        canUndo: () => cursor > 0,
        canRedo: () => cursor < entries.length - 1,
    }
}

export const getImageAltText = filename => String(filename || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[\[\]\(\)\{\}<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'image'

const getAssetLabel = filename => String(filename || 'attachment')
    .replace(/\.[^.]+$/, '')
    .replace(/[\[\]\(\)\{\}<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'attachment'

const escapeAttribute = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export const createUploadedAssetMarkdown = (url, filename, mimeType = '') => {
    const safeUrl = String(url || '').trim()
    const type = String(mimeType || '').toLowerCase()
    if (type.startsWith('video/')) return `<video controls src="${escapeAttribute(safeUrl)}"></video>`
    if (type.startsWith('audio/')) return `<audio controls src="${escapeAttribute(safeUrl)}"></audio>`
    return `[${getAssetLabel(filename)}](${safeUrl})`
}

export const initMarkdownToolbar = (root = document) => {
    const toolbar = root.querySelector('[data-markdown-toolbar]')
    const textarea = root.querySelector('#contents')
    const imageInput = root.querySelector('#markdown-toolbar-image-input')
    const assetInput = root.querySelector('#markdown-toolbar-asset-input')
    if (!toolbar || !textarea) return false
    const lang = toolbar.dataset.language || 'zh-TW'
    const history = createEditorHistory({
        value: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
    })
    let isRestoringHistory = false

    const getEditorState = () => ({
        value: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
    })

    const updateHistoryButtons = () => {
        const undoButton = toolbar.querySelector('[data-command="undo"]')
        const redoButton = toolbar.querySelector('[data-command="redo"]')
        if (undoButton) undoButton.disabled = !history.canUndo()
        if (redoButton) redoButton.disabled = !history.canRedo()
    }

    const restoreHistory = command => {
        const state = command === 'undo' ? history.undo() : history.redo()
        if (!state) return
        isRestoringHistory = true
        textarea.value = state.value
        textarea.focus()
        textarea.setSelectionRange(state.selectionStart, state.selectionEnd)
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        isRestoringHistory = false
        updateHistoryButtons()
    }

    textarea.addEventListener('input', () => {
        if (!isRestoringHistory) history.record(getEditorState())
        updateHistoryButtons()
    })

    const runCommand = command => {
        const result = applyMarkdownCommand(textarea.value, textarea.selectionStart, textarea.selectionEnd, command, lang)
        textarea.value = result.text
        textarea.focus()
        textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }

    const insertUploadedImage = (url, filename, start, end) => {
        const alt = getImageAltText(filename)
        const replacement = `![${alt}](${url})`
        textarea.value = textarea.value.slice(0, start) + replacement + textarea.value.slice(end)
        textarea.focus()
        textarea.setSelectionRange(start + replacement.length, start + replacement.length)
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }

    const uploadImage = async (file, start, end) => {
        const formData = new FormData()
        formData.append('image', file)
        const response = await fetch('/upload', { method: 'POST', body: formData })
        const payload = await response.json()
        if (!response.ok || payload.err !== 0 || !payload.data) {
            throw new Error(payload.msg || 'Image upload failed')
        }
        insertUploadedImage(payload.data, file.name, start, end)
    }

    const insertUploadedAsset = (url, file, start, end) => {
        const replacement = createUploadedAssetMarkdown(url, file.name, file.type)
        textarea.value = textarea.value.slice(0, start) + replacement + textarea.value.slice(end)
        textarea.focus()
        textarea.setSelectionRange(start + replacement.length, start + replacement.length)
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }

    const uploadAsset = async (file, start, end) => {
        if (file.type?.startsWith('image/')) {
            throw new Error('Images still use the R2 image uploader')
        }
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name || 'attachment')
        const response = await fetch(BOX_UPLOAD_ENDPOINT, { method: 'POST', body: formData })
        const payload = await response.json()
        const url = payload?.data?.url
        if (!response.ok || payload?.result !== 'success' || !url) {
            throw new Error(payload?.message || 'Attachment upload failed')
        }
        insertUploadedAsset(url, file, start, end)
    }

    const toggleFullscreen = () => {
        const pane = textarea.closest('.editor-pane')
        if (!pane) return
        if (document.fullscreenElement) {
            document.exitFullscreen?.()
        } else if (pane.requestFullscreen) {
            pane.requestFullscreen().catch(() => pane.classList.toggle('toolbar-fullscreen'))
        } else {
            pane.classList.toggle('toolbar-fullscreen')
        }
    }

    toolbar.querySelectorAll('button[data-command]').forEach(button => {
        button.addEventListener('mousedown', event => event.preventDefault())
        button.addEventListener('click', () => {
            const command = button.dataset.command
            if (command === 'undo' || command === 'redo') {
                restoreHistory(command)
                return
            }
            if (command === 'fullscreen') {
                toggleFullscreen()
                return
            }
            if (command === 'image' && imageInput) {
                imageInput.value = ''
                imageInput.dataset.selectionStart = String(textarea.selectionStart)
                imageInput.dataset.selectionEnd = String(textarea.selectionEnd)
                imageInput.click()
                return
            }
            if (command === 'asset' && assetInput) {
                assetInput.value = ''
                assetInput.dataset.selectionStart = String(textarea.selectionStart)
                assetInput.dataset.selectionEnd = String(textarea.selectionEnd)
                assetInput.click()
                return
            }
            runCommand(command)
        })
    })

    imageInput?.addEventListener('change', async () => {
        const file = imageInput.files?.[0]
        if (!file) return
        const start = Number(imageInput.dataset.selectionStart || textarea.selectionStart)
        const end = Number(imageInput.dataset.selectionEnd || textarea.selectionEnd)
        if (!window.ENABLE_R2) {
            runCommand('image')
            return
        }
        try {
            await uploadImage(file, start, end)
        } catch (error) {
            window.showToast?.(error.message || 'Image upload failed')
            if (!window.showToast) alert(error.message || 'Image upload failed')
        }
    })

    assetInput?.addEventListener('change', async () => {
        const file = assetInput.files?.[0]
        if (!file) return
        const start = Number(assetInput.dataset.selectionStart || textarea.selectionStart)
        const end = Number(assetInput.dataset.selectionEnd || textarea.selectionEnd)
        try {
            await uploadAsset(file, start, end)
        } catch (error) {
            window.showToast?.(error.message || 'Attachment upload failed')
            if (!window.showToast) alert(error.message || 'Attachment upload failed')
        }
    })

    textarea.addEventListener('keydown', event => {
        if (!(event.metaKey || event.ctrlKey) || event.altKey) return
        const key = event.key.toLowerCase()
        if (key === 'z') {
            event.preventDefault()
            restoreHistory(event.shiftKey ? 'redo' : 'undo')
            return
        }
        if (key === 'y') {
            event.preventDefault()
            restoreHistory('redo')
            return
        }
        const command = SHORTCUTS[key]
        if (!command) return
        event.preventDefault()
        runCommand(command)
    })

    updateHistoryButtons()
    return true
}

if (typeof document !== 'undefined') {
    const initialize = () => initMarkdownToolbar(document)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true })
    } else {
        initialize()
    }
}
