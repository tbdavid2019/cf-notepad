const TITLE_MAX_LENGTH = 70

function normalizeTitleCandidate(value = '') {
    return String(value || '')
        .trim()
        .replace(/^#{1,6}\s*/, '')
        .replace(/^>\s*/, '')
        .replace(/^\s*[-*+]\s+/, '')
        .replace(/^\s*\d+\.\s+/, '')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_~`]/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, TITLE_MAX_LENGTH)
        .trim()
}

function isWeakTitleCandidate(value = '') {
    return /^[a-z0-9][a-z0-9_-]{0,7}$/i.test(value.trim())
}

function tiptapNodeText(node) {
    if (!node || typeof node !== 'object') return ''
    if (typeof node.text === 'string') return node.text
    return Array.isArray(node.content) ? node.content.map(tiptapNodeText).join('') : ''
}

function getTiptapDocument(value = '') {
    const trimmed = String(value || '').trim()
    if (!trimmed.startsWith('{') || !trimmed.includes('"type":"doc"')) return null
    try {
        const parsed = JSON.parse(trimmed)
        return parsed?.type === 'doc' && Array.isArray(parsed.content) ? parsed : null
    } catch {
        return null
    }
}

function extractContentTitle(value = '') {
    const trimmedVal = String(value || '').trim()
    const tiptapDocument = getTiptapDocument(trimmedVal)
    if (tiptapDocument) {
        for (const node of tiptapDocument.content) {
            if (node?.type === 'heading' || node?.type === 'paragraph') {
                const candidate = normalizeTitleCandidate(tiptapNodeText(node))
                if (candidate) return candidate
            }
        }
        return ''
    }
    if (trimmedVal.startsWith('{') && trimmedVal.includes('"blocks"')) {
        try {
            const parsed = JSON.parse(trimmedVal)
            if (parsed && Array.isArray(parsed.blocks)) {
                for (const b of parsed.blocks) {
                    if (b && (b.type === 'heading' || b.type === 'paragraph') && b.props && typeof b.props.text === 'string' && b.props.text.trim()) {
                        const candidate = normalizeTitleCandidate(b.props.text)
                        if (candidate) return candidate
                    }
                }
                return ''
            }
        } catch (e) {}
    }

    const candidates = []
    let inFence = false
    let inFrontmatter = false
    let sawContent = false

    for (const line of String(value || '').split('\n').slice(0, 30)) {
        const trimmed = line.trim()

        if (!trimmed) continue

        if (!sawContent && trimmed === '---') {
            inFrontmatter = true
            sawContent = true
            continue
        }

        if (inFrontmatter) {
            if (trimmed === '---' || trimmed === '...') inFrontmatter = false
            continue
        }

        if (/^(```|~~~)/.test(trimmed)) {
            inFence = !inFence
            sawContent = true
            continue
        }

        if (inFence || /^[-*_]{3,}$/.test(trimmed) || /^<!--.*-->$/.test(trimmed)) {
            sawContent = true
            continue
        }

        const candidate = normalizeTitleCandidate(trimmed)
        if (candidate) candidates.push(candidate)
        sawContent = true
    }

    return candidates.find(candidate => !isWeakTitleCandidate(candidate)) || candidates[0] || ''
}

export function extractNoteTitle(value = '', metadataTitle = '', fallback = '') {
    const metadataCandidate = normalizeTitleCandidate(metadataTitle)
    const contentTitle = extractContentTitle(value)

    if (metadataCandidate && (!isWeakTitleCandidate(metadataCandidate) || !contentTitle || isWeakTitleCandidate(contentTitle))) {
        return metadataCandidate
    }

    return contentTitle || metadataCandidate || normalizeTitleCandidate(fallback)
}

export function extractNoteDescription(value = '', fallbackTitle = '') {
    let str = value
    const trimmedVal = String(value || '').trim()
    const tiptapDocument = getTiptapDocument(trimmedVal)
    if (tiptapDocument) {
        str = tiptapDocument.content.map(tiptapNodeText).filter(Boolean).join(' ')
    } else if (trimmedVal.startsWith('{') && trimmedVal.includes('"blocks"')) {
        try {
            const parsed = JSON.parse(trimmedVal)
            if (parsed && Array.isArray(parsed.blocks)) {
                str = parsed.blocks.map(b => (b && b.props && b.props.text) || '').filter(Boolean).join(' ')
            }
        } catch (e) {}
    }

    const plain = str
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/[>*_~|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    return (plain || fallbackTitle || 'Shared note on david888 wiki').substring(0, 180)
}

export function resolveAnnotationsEnabled(metadata = {}) {
    return metadata.share === true && metadata.annotationsEnabled !== false
}

export function isNewNoteEntry(requestUrl, value = '', metadata = {}) {
    let url
    try {
        url = requestUrl instanceof URL ? requestUrl : new URL(requestUrl)
    } catch {
        return false
    }

    const metadataKeys = Object.keys(metadata || {}).filter(key => metadata[key] !== undefined)
    const isCreationMetadata = metadataKeys.every(key => key === 'editorFormat' || key === 'blockDocumentVersion')

    return url.searchParams.get('new') === '1'
        && !String(value || '').trim()
        && isCreationMetadata
}

export function formatNewNoteTitle(lang = 'zh-TW', random = Math.random) {
    const openingPrompts = lang === 'en-US'
        ? [
            'Prologue / Where Every Story Begins',
            'The Art of Creation / Build Your Personal Knowledge Universe',
            'From Small Signs / Let Your Ideas Take Root and Grow',
        ]
        : [
            '序章 / 一切故事的開始',
            '天工開物 / 建立你的個人知識宇宙',
            '見微知著 / 這裡慢慢萌芽長大',
        ]
    const index = Math.min(openingPrompts.length - 1, Math.max(0, Math.floor(random() * openingPrompts.length)))
    return openingPrompts[index]
}

export function resolveEditorFormat(metadata = {}) {
    return metadata && metadata.editorFormat === 'block' ? 'block' : 'markdown'
}

export function resolveLockedEditorFormat(metadata = {}, requestedFormat = undefined) {
    const existing = metadata?.editorFormat
    if (existing !== undefined && existing !== 'block' && existing !== 'markdown') {
        throw new TypeError('Invalid stored editor format')
    }
    if (requestedFormat !== undefined && requestedFormat !== 'block' && requestedFormat !== 'markdown') {
        throw new TypeError('Invalid editor format')
    }
    if (existing && requestedFormat && existing !== requestedFormat) {
        throw new TypeError('editorFormat is immutable after note creation')
    }
    return existing || requestedFormat || 'markdown'
}
