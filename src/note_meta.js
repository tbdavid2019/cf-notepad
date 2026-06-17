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

function extractContentTitle(value = '') {
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
    const plain = value
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
